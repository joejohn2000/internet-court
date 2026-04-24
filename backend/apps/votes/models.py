from django.db import models
from django.contrib.auth import get_user_model
from apps.cases.models import Case

User = get_user_model()

class Vote(models.Model):
    VOTE_CHOICES = [
        ('you_messed_up', 'You Messed Up'),
        ('they_messed_up', 'They Messed Up'),
        ('both_messed_up', 'Both Messed Up'),
        ('nobody_messed_up', 'Nobody Messed Up'),
        ('guilty', 'Legacy: You Messed Up'),
        ('not_guilty', 'Legacy: They Messed Up'),
        ('esh', 'Legacy: Both Messed Up'),
    ]

    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='votes')
    voter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='votes')
    ip_address = models.GenericIPAddressField(db_index=True)
    decision = models.CharField(max_length=20, choices=VOTE_CHOICES)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # One vote per system (IP) per case
        unique_together = ('case', 'ip_address')

    def __str__(self):
        v = self.voter.username if self.voter else self.ip_address
        return f"{v} voted {self.decision} on Case #{self.case_id}"
