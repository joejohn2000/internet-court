from django.db import models
from django.contrib.auth import get_user_model
from apps.cases.models import Case

User = get_user_model()

class Vote(models.Model):
    VOTE_CHOICES = [
        ('guilty', 'Guilty'),
        ('not_guilty', 'Not Guilty'),
        ('esh', 'Everyone Sucks Here'),
    ]

    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='votes')
    voter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')
    decision = models.CharField(max_length=20, choices=VOTE_CHOICES)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # A user can only vote once per case
        unique_together = ('case', 'voter')

    def __str__(self):
        return f"{self.voter.username} voted {self.decision} on Case #{self.case_id}"
