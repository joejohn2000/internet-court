from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.cases.models import Case, Category
from apps.votes.models import Vote
from apps.feedback.models import Feedback
from django.utils import timezone
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial data for the Internet Court backend based on workflow imagery.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding data...")

        # 1. Create Users
        usernames = ['PlaintiffPaul', 'DefendantDan', 'JudgeJulie', 'WitnessWill', 'JurorJane']
        users = []
        for uname in usernames:
            user, created = User.objects.get_or_create(username=uname)
            if created:
                user.set_password('password123')
                user.save()
            users.append(user)

        # 2. Create Categories
        cat_data = [
            ('Relationship Advice', 'relationship-advice'),
            ('Office Drama', 'office-drama'),
            ('Pet Peeves', 'pet-peeves'),
            ('Roommate Wars', 'roommate-wars'),
            ('Public Shaming', 'public-shaming'),
            ('Tech Troubles', 'tech-troubles'),
        ]
        categories = []
        for name, slug in cat_data:
            cat, _ = Category.objects.get_or_create(name=name, slug=slug)
            categories.append(cat)

        # 3. Create Cases
        case_samples = [
            {
                'title': 'AITA for eating my roommate\'s labeled leftovers?',
                'story': "I came home starving after a 12-hour shift. My roommate had high-quality sushi in the fridge. It was labeled 'DAN DON'T TOUCH' but I was weak. Now Dan is moving out. Am I the monster?",
                'category': 'Roommate Wars'
            },
            {
                'title': 'My boss asked for a 2-hour unpaid weekend meeting',
                'story': "I'm a junior designer and my boss sent a Slack on Saturday morning saying 'Quick catch up, unpaid but good for the team culture'. I said no. Am I being 'un-professional'?",
                'category': 'Office Drama'
            },
            {
                'title': 'Is it okay to bring my emotional support iguana to a wedding?',
                'story': "Iggy is very well-behaved but the bride (my sister) says it will 'ruin the aesthetic'. I feel like my needs are being ignored.",
                'category': 'Public Shaming'
            },
            {
                'title': 'Boyfriend still uses his ex\'s Netflix password',
                'story': "We've been dating for 3 years. He still logs into his ex-girlfriend's Netflix. He says it's 'just a free service' but it feels disrespectful. Help?",
                'category': 'Relationship Advice'
            }
        ]

        cases = []
        for data in case_samples:
            category = next(c for c in categories if c.name == data['category'])
            author = random.choice(users)
            case, created = Case.objects.get_or_create(
                title_hook=data['title'],
                category=category,
                author=author,
                defaults={'full_story': data['story'], 'ai_suggested_hook': data['title'] + " - (AI Polished)"}
            )
            cases.append(case)

        # 4. Create Votes
        decisions = ['guilty', 'not_guilty', 'esh']
        for case in cases:
            for juror in users:
                # Juror doesn't vote on their own case
                if juror != case.author:
                    Vote.objects.get_or_create(
                        case=case,
                        voter=juror,
                        defaults={'decision': random.choice(decisions)}
                    )

        # 5. Create Feedback
        feedback_types = ['bug', 'feature', 'other']
        feedback_messages = [
            "Add a 'Dark Mode' to the court room please!",
            "I can't submit my case on mobile, it crashes.",
            "Great app, love the judge's wig icon.",
            "Can we have a 'Death Sentence' option? (Just kidding!)"
        ]
        for msg in feedback_messages:
            Feedback.objects.get_or_create(
                feedback_type=random.choice(feedback_types),
                message=msg,
                defaults={'email': f"user{random.randint(1,100)}@example.com" if random.random() > 0.5 else None}
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded "Internet Court" data!'))
