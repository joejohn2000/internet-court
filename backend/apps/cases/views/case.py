from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from apps.cases.models import Case
from apps.cases.serializers import CaseSerializer


class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Case.objects.all().order_by('-created_at')
        
        # Simple Filtering
        name_filter = self.request.query_params.get('name')
        if name_filter:
            queryset = queryset.filter(title_hook__icontains=name_filter) | queryset.filter(author__username__icontains=name_filter)
            
        category_filter = self.request.query_params.get('category')
        if category_filter:
            queryset = queryset.filter(category__name__icontains=category_filter)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        author_id = self.request.query_params.get('author_id')
        if author_id:
            queryset = queryset.filter(author_id=author_id)

        return queryset

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def perform_create(self, serializer):
        from django.contrib.auth import get_user_model
        # Detect IP
        x_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_for:
            ip = x_for.split(',')[0].strip()
        else:
            ip = self.request.META.get('REMOTE_ADDR')

        # Identify User (optional)
        author = None
        if self.request.user and self.request.user.is_authenticated:
            author = self.request.user
        else:
            user_id = self.request.headers.get('X-User-Id') or self.request.META.get('HTTP_X_USER_ID')
            if user_id:
                try:
                    author = get_user_model().objects.get(id=int(user_id))
                except (ValueError, TypeError, get_user_model().DoesNotExist):
                    pass

        serializer.save(author=author, ip_address=ip)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def request_ai_hook(self, request, pk=None):
        case = self.get_object()
        case.ai_suggested_hook = f"Improved: {case.title_hook} (AI Enhanced)"
        case.save()
        return Response({'ai_suggested_hook': case.ai_suggested_hook}, status=status.HTTP_200_OK)
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny], url_path='generate_judge_analysis')
    def generate_judge_analysis(self, request, pk=None):
        case = self.get_object()
        if case.judge_analysis:
            return Response({'judge_analysis': case.judge_analysis}, status=status.HTTP_200_OK)
            
        time_since_creation = timezone.now() - case.created_at
        if time_since_creation < timedelta(minutes=1):
            return Response({'error': 'Judge analysis is still locked.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Generate mock AI analysis
        analysis = (
            f"JUDGE OPINION ON DOCKET #{case.id}:\n\n"
            f"After careful review of the submitted record ('{case.title_hook}'), "
            "the court finds the sequence of events highly controversial. "
            "The plaintiff's actions appear to be driven by emotional distress, "
            "yet the defendant's boundaries must be respected. "
            "This court advises the jury to proceed with caution and weigh the mitigating circumstances presented in the full story."
        )
        case.judge_analysis = analysis
        case.save()
        return Response({'judge_analysis': case.judge_analysis}, status=status.HTTP_200_OK)
