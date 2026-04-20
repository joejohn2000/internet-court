from rest_framework import serializers
from django.utils import timezone
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
    judge_analysis = serializers.SerializerMethodField()

    # Vote counts
    votes_guilty = serializers.SerializerMethodField()
    votes_not_guilty = serializers.SerializerMethodField()
    votes_esh = serializers.SerializerMethodField()
    total_votes = serializers.SerializerMethodField()
    user_has_voted = serializers.SerializerMethodField()
    can_view_distribution = serializers.SerializerMethodField()
    can_view_ai_verdict = serializers.SerializerMethodField()

    class Meta:
        model = Case
        fields = [
            'id', 'author_name', 'category', 'category_id',
            'title_hook', 'ai_suggested_hook', 'full_story', 'judge_analysis',
            'status', 'verdict_timer_ends', 'created_at',
            'votes_guilty', 'votes_not_guilty', 'votes_esh', 
            'total_votes', 'user_has_voted', 'can_view_distribution', 'can_view_ai_verdict',
            'comments',
        ]
        read_only_fields = ['verdict_timer_ends', 'ai_suggested_hook', 'judge_analysis']

    def get_author_name(self, obj):
        if obj.author:
            return obj.author.username
        return 'Anonymous'

    def get_votes_guilty(self, obj):
        if not self._can_view_distribution(obj):
            return None
        return obj.votes.filter(decision='guilty').count()

    def get_votes_not_guilty(self, obj):
        if not self._can_view_distribution(obj):
            return None
        return obj.votes.filter(decision='not_guilty').count()

    def get_votes_esh(self, obj):
        if not self._can_view_distribution(obj):
            return None
        return obj.votes.filter(decision='esh').count()

    def get_total_votes(self, obj):
        return obj.votes.count()

    def get_user_has_voted(self, obj):
        ip = self._get_client_ip()
        return bool(ip and obj.votes.filter(ip_address=ip).exists())

    def get_can_view_distribution(self, obj):
        return self._can_view_distribution(obj)

    def get_can_view_ai_verdict(self, obj):
        return self._is_verdict_unlocked(obj)

    def get_judge_analysis(self, obj):
        if not self._is_verdict_unlocked(obj):
            return None
        return obj.judge_analysis

    def _is_verdict_unlocked(self, obj):
        if not obj.verdict_timer_ends:
            return False
        return timezone.now() >= obj.verdict_timer_ends

    def _can_view_distribution(self, obj):
        return self._is_verdict_unlocked(obj) or self.get_user_has_voted(obj)

    def _get_client_ip(self):
        request = self.context.get('request')
        if not request:
            return None
            
        # Get client IP
        x_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_for:
            return x_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
