from rest_framework import serializers
from .models import Vote


from apps.cases.serializers import CaseSerializer

class VoteSerializer(serializers.ModelSerializer):
    case_details = CaseSerializer(source='case', read_only=True)
    
    class Meta:
        model = Vote
        fields = ['id', 'case', 'case_details', 'voter', 'decision', 'created_at']
        read_only_fields = ['voter', 'created_at']
