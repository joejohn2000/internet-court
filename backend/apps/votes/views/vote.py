from rest_framework import viewsets, permissions, status, mixins
from rest_framework.response import Response
from apps.votes.models import Vote
from apps.votes.serializers import VoteSerializer

from .utils import get_client_ip, get_voter


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

    def get_queryset(self):
        qs = Vote.objects.all().order_by('-created_at')
        user_id = self.request.query_params.get('user_id')
        if user_id:
            qs = qs.filter(voter_id=user_id)
        return qs

    def create(self, request, *args, **kwargs):
        case_id = request.data.get('case')
        decision = request.data.get('decision')

        if not case_id or not decision:
            return Response(
                {'error': 'Both case and decision are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ip = get_client_ip(request)
        voter = get_voter(request)

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
