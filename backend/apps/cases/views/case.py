from rest_framework.decorators import action
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from django.conf import settings
from django.core.cache import cache
from django.db.models import Count, Q
from django.db.models import Prefetch
from django.utils import timezone
from apps.cases.models import Case
from apps.cases.models.comment import Comment
from apps.cases.serializers import CaseSerializer
from core.request import get_client_ip
from core.throttles import AIGenerationRateThrottle, CaseSubmitRateThrottle

YOU_MESSED_UP_DECISIONS = ('you_messed_up', 'guilty')
THEY_MESSED_UP_DECISIONS = ('they_messed_up', 'not_guilty')
BOTH_MESSED_UP_DECISIONS = ('both_messed_up', 'esh')
NOBODY_MESSED_UP_DECISIONS = ('nobody_messed_up',)
PUBLIC_CASE_TOTAL_CACHE_KEY = 'cases:public_total:v1'


class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = (
            Case.objects.select_related('category', 'author')
            .prefetch_related(
                Prefetch(
                    'comments',
                    queryset=Comment.objects.select_related('author').order_by('created_at')
                )
            )
            .annotate(
                total_votes_count=Count('votes', distinct=True),
                votes_guilty_count=Count(
                    'votes',
                    filter=Q(votes__decision__in=YOU_MESSED_UP_DECISIONS),
                    distinct=True,
                ),
                votes_not_guilty_count=Count(
                    'votes',
                    filter=Q(votes__decision__in=THEY_MESSED_UP_DECISIONS),
                    distinct=True,
                ),
                votes_esh_count=Count(
                    'votes',
                    filter=Q(votes__decision__in=BOTH_MESSED_UP_DECISIONS),
                    distinct=True,
                ),
                votes_nobody_count=Count(
                    'votes',
                    filter=Q(votes__decision__in=NOBODY_MESSED_UP_DECISIONS),
                    distinct=True,
                ),
            )
        )
        is_admin = self.request.user.is_authenticated and self.request.user.is_staff
        
        # Simple Filtering
        name_filter = self.request.query_params.get('name')
        if name_filter:
            queryset = queryset.filter(
                Q(title_hook__icontains=name_filter)
                | Q(author__username__icontains=name_filter)
                | Q(guest_alias__icontains=name_filter)
            )
            
        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category__name__icontains=category_filter)

        category_id_filter = self.request.query_params.get('category_id')
        if category_id_filter:
            queryset = queryset.filter(category_id=category_id_filter)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        author_id = self.request.query_params.get('author_id')
        if author_id:
            # Only allow filtering by author_id if it's the user themselves or they are staff
            if self.request.user.is_authenticated and (str(self.request.user.id) == str(author_id) or self.request.user.is_staff):
                queryset = queryset.filter(author_id=author_id)
            else:
                # If they try to peek at someone else's history, return nothing or error
                queryset = queryset.none()
        elif not is_admin:
            queryset = queryset.filter(is_public=True)

        feed_filter = self.request.query_params.get('feed', 'all')
        if feed_filter == 'recent':
            return queryset.filter(status='open').order_by('-created_at')
        if feed_filter == 'resolved':
            return queryset.filter(status='closed').order_by('-updated_at', '-created_at')
        if feed_filter == 'trending':
            return queryset.annotate(vote_total=Count('votes')).order_by('-vote_total', '-created_at')

        return queryset.order_by('-created_at')

    def _clear_case_caches(self):
        cache.delete(PUBLIC_CASE_TOTAL_CACHE_KEY)

    def _get_total_public_count(self):
        if self.request.query_params.get('author_id'):
            return None

        is_admin = self.request.user.is_authenticated and self.request.user.is_staff
        if is_admin:
            return Case.objects.count()

        cached_total = cache.get(PUBLIC_CASE_TOTAL_CACHE_KEY)
        if cached_total is not None:
            return cached_total

        total_public_count = Case.objects.filter(is_public=True).count()
        cache.set(
            PUBLIC_CASE_TOTAL_CACHE_KEY,
            total_public_count,
            settings.CACHE_PUBLIC_CASE_TOTAL_SECONDS,
        )
        return total_public_count

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        if self.action == 'request_ai_hook':
            return [permissions.IsAuthenticated()]
        if self.request.query_params.get('author_id'):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_throttles(self):
        if self.action == 'create':
            return [CaseSubmitRateThrottle()]
        if self.action in ['request_ai_hook', 'generate_judge_analysis']:
            return [AIGenerationRateThrottle()]
        return super().get_throttles()

    def perform_create(self, serializer):
        ip = get_client_ip(self.request)
        author = None
        guest_alias = ''
        post_anonymously = str(self.request.data.get('post_anonymously', '')).lower() in {'1', 'true', 'yes', 'on'}
        if self.request.user and self.request.user.is_authenticated and not post_anonymously:
            author = self.request.user
        else:
            guest_alias = str(self.request.data.get('guest_alias', '')).strip()[:64]
        serializer.save(author=author, guest_alias=guest_alias, ip_address=ip, status='open')
        self._clear_case_caches()

    def perform_update(self, serializer):
        serializer.save()
        self._clear_case_caches()

    def perform_destroy(self, instance):
        instance.delete()
        self._clear_case_caches()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        payload = {
            'count': queryset.count(),
            'total_public_count': self._get_total_public_count(),
            'results': serializer.data,
        }
        return Response(payload)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def request_ai_hook(self, request, pk=None):
        case = self.get_object()
        if case.author_id not in {None, request.user.id} and not request.user.is_staff:
            return Response({'error': 'You do not have permission to modify this case.'}, status=status.HTTP_403_FORBIDDEN)
        from apps.cases.utils import generate_ai_hook
        case.ai_suggested_hook = generate_ai_hook(case.title_hook, case.full_story)
        case.save()
        return Response({'ai_suggested_hook': case.ai_suggested_hook}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny], url_path='generate_judge_analysis')
    def generate_judge_analysis(self, request, pk=None):
        case = self.get_object()
        force_refresh = bool(request.data.get('refresh', False))
        if force_refresh and not request.user.is_staff:
            return Response({'error': 'Only administrators can refresh judge analysis.'}, status=status.HTTP_403_FORBIDDEN)
        if case.judge_analysis and not force_refresh:
            if not case.judge_analysis.startswith("JUDGE OPINION ON DOCKET"):
                return Response({'judge_analysis': case.judge_analysis}, status=status.HTTP_200_OK)
            
        if case.verdict_timer_ends and timezone.now() < case.verdict_timer_ends:
            return Response({'error': 'Judge analysis is still locked.'}, status=status.HTTP_400_BAD_REQUEST)
            
        from apps.cases.utils import generate_ai_analysis
        analysis = generate_ai_analysis(case.id, case.title_hook, case.full_story)
        
        case.judge_analysis = analysis
        case.save()
        return Response({'judge_analysis': case.judge_analysis}, status=status.HTTP_200_OK)
