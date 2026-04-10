from rest_framework import serializers
from apps.cases.models import Case, Category
from .category import CategorySerializer
from .comment import CommentSerializer


class CaseSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )
    author_name = serializers.SerializerMethodField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    # Vote counts
    votes_guilty = serializers.SerializerMethodField()
    votes_not_guilty = serializers.SerializerMethodField()
    votes_esh = serializers.SerializerMethodField()
    total_votes = serializers.SerializerMethodField()
    user_has_voted = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            'id', 'author_name', 'category', 'category_id',
            'title_hook', 'ai_suggested_hook', 'full_story', 'judge_analysis',
            'status', 'verdict_timer_ends', 'created_at',
            'votes_guilty', 'votes_not_guilty', 'votes_esh', 
            'total_votes', 'user_has_voted', 'comments',
        ]
        read_only_fields = ['status', 'verdict_timer_ends', 'ai_suggested_hook', 'judge_analysis']

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.username
        return 'Anonymous'

    def get_votes_guilty(self, obj):
        return obj.votes.filter(decision='guilty').count()

    def get_votes_not_guilty(self, obj):
        return obj.votes.filter(decision='not_guilty').count()

    def get_votes_esh(self, obj):
        return obj.votes.filter(decision='esh').count()

    def get_total_votes(self, obj):
        return obj.votes.count()

    def get_user_has_voted(self, obj):
        request = self.context.get('request')
        if not request:
            return False
            
        # Get client IP
        x_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_for:
            ip = x_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')

        return obj.votes.filter(ip_address=ip).exists()
