from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Vote
from .serializers import VoteSerializer


class VoteViewSet(viewsets.ModelViewSet):
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        case_id = request.data.get('case')
        decision = request.data.get('decision')

        if not case_id or not decision:
            return Response(
                {'error': 'Both case and decision are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        voter = request.user

        # PREVENT DUPLICATE VOTES
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
