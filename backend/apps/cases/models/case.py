from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from .category import Category

User = get_user_model()


class Case(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open for Judging'),
        ('closed', 'Verdict Reached'),
    ]

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cases', null=True, blank=True)
    author_profile_image = models.URLField(max_length=500, blank=True, default='')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    ip_address = models.GenericIPAddressField(db_index=True)
    guest_alias = models.CharField(max_length=64, blank=True, default='')
    
    title_hook = models.CharField(max_length=255, help_text="The hook to capture attention")
    ai_suggested_hook = models.CharField(max_length=255, blank=True, null=True)
    judge_analysis = models.TextField(blank=True, null=True)
    
    full_story = models.TextField()
    self_perspective = models.TextField(blank=True, default='')
    other_perspective = models.TextField(blank=True, default='')
    why_right = models.TextField(blank=True, default='')
    extra_context = models.TextField(blank=True, default='')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    is_public = models.BooleanField(default=True)
    verdict_timer_ends = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.pk and not self.verdict_timer_ends:
            self.verdict_timer_ends = timezone.now() + timedelta(
                minutes=settings.CASE_VERDICT_DELAY_MINUTES
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Case #{self.id} - {self.title_hook[:20]}"
