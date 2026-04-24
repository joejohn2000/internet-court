from rest_framework import mixins, permissions, viewsets
from .models import Feedback
from .serializers import FeedbackSerializer
from core.throttles import FeedbackCreateRateThrottle


class FeedbackViewSet(mixins.CreateModelMixin,
                      mixins.ListModelMixin,
                      mixins.RetrieveModelMixin,
                      mixins.DestroyModelMixin,
                      viewsets.GenericViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def get_throttles(self):
        if self.action == 'create':
            return [FeedbackCreateRateThrottle()]
        return super().get_throttles()
