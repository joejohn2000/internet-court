from math import ceil

from django.utils import timezone
from rest_framework import serializers

from apps.cases.models import Case, Category
from core.request import get_client_ip

from .category import CategorySerializer
from .comment import CommentSerializer

YOU_MESSED_UP_DECISIONS = ('you_messed_up', 'guilty')
THEY_MESSED_UP_DECISIONS = ('they_messed_up', 'not_guilty')
BOTH_MESSED_UP_DECISIONS = ('both_messed_up', 'esh')
NOBODY_MESSED_UP_DECISIONS = ('nobody_messed_up',)


class BaseCaseSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )
    author_name = serializers.SerializerMethodField(read_only=True)
    author_profile_image = serializers.SerializerMethodField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    judge_analysis = serializers.SerializerMethodField()
    preview_snippet = serializers.SerializerMethodField()
    read_time_minutes = serializers.SerializerMethodField()

    # Vote counts
    votes_guilty = serializers.SerializerMethodField()
    votes_not_guilty = serializers.SerializerMethodField()
    votes_esh = serializers.SerializerMethodField()
    votes_nobody = serializers.SerializerMethodField()
    total_votes = serializers.SerializerMethodField()
    user_has_voted = serializers.SerializerMethodField()
    can_view_distribution = serializers.SerializerMethodField()
    can_view_ai_verdict = serializers.SerializerMethodField()

    def validate_title_hook(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError('Title hook must be at least 10 characters long.')
        if len(value) > 255:
            raise serializers.ValidationError('Title hook must be 255 characters or fewer.')
        return value

    def validate_full_story(self, value):
        value = value.strip()
        word_count = len(value.split())
        if word_count < 100:
            raise serializers.ValidationError('Story must be at least 100 words long.')
        if word_count > 1000:
            raise serializers.ValidationError('Story must be 1000 words or fewer.')
        return value

    def validate_guest_alias(self, value):
        return value.strip()[:64]

    def validate_self_perspective(self, value):
        return value.strip()

    def validate_other_perspective(self, value):
        return value.strip()

    def validate_why_right(self, value):
        return value.strip()

    def validate_extra_context(self, value):
        return value.strip()

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

    def get_author_profile_image(self, obj):
        if obj.author:
            profile = getattr(obj.author, 'profile', None)
            return (getattr(profile, 'profile_image', '') or obj.author_profile_image or '').strip()
        return ''

    def get_preview_snippet(self, obj):
        text = (obj.full_story or '').strip()
        if len(text) <= 140:
            return text
        return f'{text[:137].rstrip()}...'

    def get_read_time_minutes(self, obj):
        words = len((obj.full_story or '').split())
        return max(1, ceil(words / 200))

    def get_votes_guilty(self, obj):
        if not self._can_view_distribution(obj):
            return None
        annotated_value = getattr(obj, 'votes_guilty_count', None)
        if annotated_value is not None:
            return annotated_value
        return obj.votes.filter(decision__in=YOU_MESSED_UP_DECISIONS).count()

    def get_votes_not_guilty(self, obj):
        if not self._can_view_distribution(obj):
            return None
        annotated_value = getattr(obj, 'votes_not_guilty_count', None)
        if annotated_value is not None:
            return annotated_value
        return obj.votes.filter(decision__in=THEY_MESSED_UP_DECISIONS).count()

    def get_votes_esh(self, obj):
        if not self._can_view_distribution(obj):
            return None
        annotated_value = getattr(obj, 'votes_esh_count', None)
        if annotated_value is not None:
            return annotated_value
        return obj.votes.filter(decision__in=BOTH_MESSED_UP_DECISIONS).count()

    def get_votes_nobody(self, obj):
        if not self._can_view_distribution(obj):
            return None
        annotated_value = getattr(obj, 'votes_nobody_count', None)
        if annotated_value is not None:
            return annotated_value
        return obj.votes.filter(decision__in=NOBODY_MESSED_UP_DECISIONS).count()

    def get_total_votes(self, obj):
        annotated_value = getattr(obj, 'total_votes_count', None)
        if annotated_value is not None:
            return annotated_value
        return obj.votes.count()

    def get_user_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            if obj.votes.filter(voter_id=request.user.id).exists():
                return True

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
        return get_client_ip(request)


class CaseListSerializer(BaseCaseSerializer):
    class Meta:
        model = Case
        fields = [
            'id', 'author_name', 'author_profile_image', 'category', 'category_id',
            'title_hook', 'preview_snippet', 'read_time_minutes', 'guest_alias',
            'is_public', 'status', 'verdict_timer_ends', 'created_at',
            'votes_guilty', 'votes_not_guilty', 'votes_esh', 'votes_nobody',
            'total_votes', 'user_has_voted', 'can_view_distribution',
            'can_view_ai_verdict', 'judge_analysis',
        ]
        read_only_fields = ['verdict_timer_ends', 'judge_analysis']


class CaseSerializer(BaseCaseSerializer):
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Case
        fields = [
            'id', 'author_name', 'author_profile_image', 'category', 'category_id',
            'title_hook', 'ai_suggested_hook', 'full_story', 'self_perspective',
            'other_perspective', 'why_right', 'extra_context', 'judge_analysis',
            'preview_snippet', 'read_time_minutes', 'guest_alias', 'is_public',
            'status', 'verdict_timer_ends', 'created_at',
            'votes_guilty', 'votes_not_guilty', 'votes_esh', 'votes_nobody',
            'total_votes', 'user_has_voted', 'can_view_distribution', 'can_view_ai_verdict',
            'comments',
        ]
        read_only_fields = ['verdict_timer_ends', 'ai_suggested_hook', 'judge_analysis']
