from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Case, Category
from .serializers import CaseSerializer, CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
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
        User = get_user_model()

        # Support anonymous submission: use a fallback "Anonymous" system user
        if self.request.user and self.request.user.is_authenticated:
            author = self.request.user
        else:
            # Get or create an anonymous system user
            author, _ = User.objects.get_or_create(
                username='anonymous',
                defaults={'email': '', 'is_active': True}
            )
        
        # Override the username display if submitter provided a name
        submitter_name = self.request.data.get('author_name', '').strip()
        if submitter_name:
            # Get or create a user with that display name
            display_user, _ = User.objects.get_or_create(
                username=submitter_name,
                defaults={'email': '', 'is_active': True}
            )
            author = display_user

        serializer.save(author=author)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def request_ai_hook(self, request, pk=None):
        case = self.get_object()
        case.ai_suggested_hook = f"Improved: {case.title_hook} (AI Enhanced)"
        case.save()
        return Response({'ai_suggested_hook': case.ai_suggested_hook}, status=status.HTTP_200_OK)
