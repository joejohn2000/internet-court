from rest_framework import viewsets, permissions, status, mixins
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Case, Category
from .serializers import CaseSerializer, CategorySerializer


class CategoryViewSet(mixins.CreateModelMixin,
                      mixins.RetrieveModelMixin,
                      mixins.UpdateModelMixin,
                      mixins.DestroyModelMixin,
                      mixins.ListModelMixin,
                      viewsets.GenericViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


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
