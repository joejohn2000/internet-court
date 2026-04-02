from django.db import models

class Feedback(models.Model):
    TYPE_CHOICES = [
        ('bug', 'Bug Report'),
        ('feature', 'Feature Request'),
        ('other', 'Other'),
    ]

    feedback_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message = models.TextField()
    email = models.EmailField(blank=True, null=True, help_text="Optional, only used if user wants a reply")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback ({self.feedback_type}) - {self.created_at.strftime('%Y-%m-%d')}"
