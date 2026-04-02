from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Vote
from .serializers import VoteSerializer


class VoteViewSet(viewsets.ModelViewSet):
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

        # For anonymous voting, use session-based or IP-based dedup
        # For now, just create the vote
        vote = Vote.objects.create(
            case_id=case_id,
            voter_id=1,  # Default to first user for anonymous votes
            decision=decision,
        )
        serializer = self.get_serializer(vote)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
