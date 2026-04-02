from rest_framework import serializers
from .models import Vote


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'case', 'voter', 'decision', 'created_at']
        read_only_fields = ['voter', 'created_at']
