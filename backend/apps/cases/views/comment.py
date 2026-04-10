from rest_framework import viewsets, permissions
from apps.cases.models import Comment
from apps.cases.serializers import CommentSerializer


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        from django.contrib.auth import get_user_model
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
        serializer.save(author=author)
