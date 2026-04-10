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
