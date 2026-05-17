from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response
from apps.cases.cache_utils import bump_public_case_feed_version
from apps.votes.models import Vote
from apps.votes.serializers import VoteSerializer

from .utils import get_client_ip, get_voter
from core.throttles import VoteCreateRateThrottle


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
    
    def get_permissions(self):
        if self.request.query_params.get('user_id'):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_throttles(self):
        if self.action == 'create':
            return [VoteCreateRateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        qs = Vote.objects.all().order_by('-created_at')
        user_id = self.request.query_params.get('user_id')
        if user_id:
            # Only allow filtering by user_id if it's the user themselves or they are staff
            if self.request.user.is_authenticated and (str(self.request.user.id) == str(user_id) or self.request.user.is_staff):
                qs = qs.filter(voter_id=user_id)
            else:
                qs = qs.none()
        return qs

    def create(self, request, *args, **kwargs):
        case_id = request.data.get('case')
        decision = request.data.get('decision')
        allowed_decisions = {choice for choice, _label in Vote.VOTE_CHOICES}

        if not case_id or not decision:
            return Response(
                {'error': 'Both case and decision are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if decision not in allowed_decisions:
            return Response(
                {'error': 'That verdict option is not valid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ip = get_client_ip(request)
        voter = get_voter(request)
        if not ip:
            return Response({'error': 'Unable to identify requester.'}, status=status.HTTP_400_BAD_REQUEST)

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
        bump_public_case_feed_version()
        serializer = self.get_serializer(vote)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
