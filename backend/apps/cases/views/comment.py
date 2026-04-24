from rest_framework import mixins, permissions, viewsets
from apps.cases.models import Comment
from apps.cases.serializers import CommentSerializer
from core.throttles import CommentCreateRateThrottle


class CommentViewSet(mixins.CreateModelMixin,
                     mixins.ListModelMixin,
                     mixins.RetrieveModelMixin,
                     viewsets.GenericViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]

    def get_throttles(self):
        if self.action == 'create':
            return [CommentCreateRateThrottle()]
        return super().get_throttles()

    def perform_create(self, serializer):
        author = None
        if self.request.user and self.request.user.is_authenticated:
            author = self.request.user
        serializer.save(author=author)
