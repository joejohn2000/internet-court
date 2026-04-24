from rest_framework import serializers
from apps.cases.models import Comment


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'case', 'author_name', 'content', 'created_at']
        read_only_fields = ['author_name', 'created_at']

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.username
        return 'Anonymous'

    def validate_content(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError('Comment must be at least 3 characters long.')
        if len(value) > 2000:
            raise serializers.ValidationError('Comment must be 2000 characters or fewer.')
        return value
