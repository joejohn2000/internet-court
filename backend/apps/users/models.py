from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=150, blank=True, default='')
    profile_image = models.URLField(max_length=500, blank=True, default='')

    def __str__(self):
        return self.display_name or self.user.username
