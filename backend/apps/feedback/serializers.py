from rest_framework import serializers
from .models import Feedback


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'feedback_type', 'message', 'email', 'created_at']
        read_only_fields = ['created_at']

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError('Feedback message must be at least 10 characters long.')
        if len(value) > 2000:
            raise serializers.ValidationError('Feedback message must be 2000 characters or fewer.')
        return value
