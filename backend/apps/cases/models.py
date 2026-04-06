from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

class Case(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open for Judging'),
        ('closed', 'Verdict Reached'),
    ]

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cases', null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    ip_address = models.GenericIPAddressField(db_index=True)
    
    title_hook = models.CharField(max_length=255, help_text="The hook to capture attention")
    ai_suggested_hook = models.CharField(max_length=255, blank=True, null=True)
    
    full_story = models.TextField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    verdict_timer_ends = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.pk and not self.verdict_timer_ends:
            # 12-hour unlock timer logic as seen in wireframe
            self.verdict_timer_ends = timezone.now() + timedelta(hours=12)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Case #{self.id} - {self.title_hook[:20]}"
