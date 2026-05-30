from rest_framework import serializers
from apps.cases.models import Comment


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'case', 'author_name', 'guest_alias', 'content', 'created_at']
        read_only_fields = ['author_name', 'created_at']

    def get_author_name(self, obj):
        if obj.author:
            profile = getattr(obj.author, 'profile', None)
            if profile and profile.display_name:
                return profile.display_name
            full_name = f'{obj.author.first_name} {obj.author.last_name}'.strip()
            return full_name or obj.author.username
        if obj.guest_alias:
            return obj.guest_alias
        return 'Anonymous'

    def validate_guest_alias(self, value):
        return value.strip()[:64]

    def validate_content(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError('Comment must be at least 3 characters long.')
        if len(value) > 2000:
            raise serializers.ValidationError('Comment must be 2000 characters or fewer.')
        return value
