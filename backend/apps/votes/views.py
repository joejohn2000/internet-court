from rest_framework import viewsets, permissions, status, mixins
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Vote
from .serializers import VoteSerializer


def _get_voter(request):
    """Identify the voter: session user first, then X-User-Id header fallback."""
    if request.user and request.user.is_authenticated:
        return request.user
    
    # Fallback to header-based identification (used in some cross-origin scenarios)
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

        voter = _get_voter(request)
        if not voter:
            return Response(
                {'error': 'You must be logged in to vote.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # PREVENT DUPLICATE VOTES — one vote per user per case
        if Vote.objects.filter(case_id=case_id, voter=voter).exists():
            return Response(
                {'error': 'You have already voiced your verdict on this case.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        vote = Vote.objects.create(
            case_id=case_id,
            voter=voter,
            decision=decision,
        )
        serializer = self.get_serializer(vote)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
