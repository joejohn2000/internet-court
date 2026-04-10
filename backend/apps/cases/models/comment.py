from django.db import models
from django.contrib.auth import get_user_model

from .case import Case

User = get_user_model()


class Comment(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        a = self.author.username if self.author else "Anonymous"
        return f"Comment by {a} on Case #{self.case_id}"
