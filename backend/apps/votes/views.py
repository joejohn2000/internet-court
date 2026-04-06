from rest_framework import viewsets, permissions, status, mixins
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Vote
from .serializers import VoteSerializer


def get_client_ip(request):
    """Detects the real IP address of the client."""
    x_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_for:
        return x_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def _get_voter(request):
    """Identify the voter account if logged in (optional)."""
    if request.user and request.user.is_authenticated:
        return request.user
    
    user_id = request.headers.get('X-User-Id') or request.META.get('HTTP_X_USER_ID')
    if user_id:
        try:
            return get_user_model().objects.get(id=int(user_id))
        except (ValueError, TypeError, get_user_model().DoesNotExist):
            pass
    return None


class VoteViewSet(mixins.CreateModelMixin,
                  mixins.ListModelMixin,
                  mixins.RetrieveModelMixin,
                  viewsets.GenericViewSet):
    """
    ViewSet for handling votes. 
    Strictly enforced: One user can only vote once per case.
    Updates and deletions are disabled for verdict finality.
    """
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        case_id = request.data.get('case')
        decision = request.data.get('decision')

        if not case_id or not decision:
            return Response(
                {'error': 'Both case and decision are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ip = get_client_ip(request)
        voter = _get_voter(request)

        # PREVENT DUPLICATE VOTES — one vote per system (IP) per case
        if Vote.objects.filter(case_id=case_id, ip_address=ip).exists():
            return Response(
                {'error': 'Your system has already voiced a verdict on this case.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        vote = Vote.objects.create(
            case_id=case_id,
            voter=voter,
            ip_address=ip,
            decision=decision,
        )
        serializer = self.get_serializer(vote)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
