from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.cases.models import Case, Category
from apps.votes.models import Vote

VALID_CASE_STORY = ' '.join(['context'] * 120)


class HeaderSpoofingTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='claimed-user',
            email='claimed@example.com',
            password='ClaimedPass123!',
        )
        self.category = Category.objects.create(name='General', slug='general')
        self.case = Case.objects.create(
            category=self.category,
            title_hook='A detailed case title for testing',
            full_story='This is a sufficiently long case body for the automated test suite.',
            ip_address='127.0.0.1',
        )

    def test_case_create_ignores_client_supplied_user_header(self):
        response = self.client.post(
            '/api/cases/',
            {
                'category_id': self.category.id,
                'title_hook': 'Another detailed case title',
                'full_story': VALID_CASE_STORY,
            },
            format='json',
            HTTP_X_USER_ID=str(self.user.id),
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_case = Case.objects.get(pk=response.data['id'])
        self.assertIsNone(created_case.author)

    def test_vote_create_ignores_client_supplied_user_header(self):
        response = self.client.post(
            '/api/votes/',
            {
                'case': self.case.id,
                'decision': 'guilty',
            },
            format='json',
            HTTP_X_USER_ID=str(self.user.id),
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        vote = Vote.objects.get(pk=response.data['id'])
        self.assertIsNone(vote.voter)

    def test_case_serializer_prefers_author_name_and_profile_image(self):
        self.user.first_name = 'Joe'
        self.user.last_name = 'John'
        self.user.save(update_fields=['first_name', 'last_name'])
        self.case.author = self.user
        self.case.author_profile_image = 'https://lh3.googleusercontent.com/a/joe-photo=s96-c'
        self.case.guest_alias = ''
        self.case.save(update_fields=['author', 'author_profile_image', 'guest_alias'])

        response = self.client.get('/api/cases/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['author_name'], 'Joe John')
        self.assertEqual(
            response.data['results'][0]['author_profile_image'],
            'https://lh3.googleusercontent.com/a/joe-photo=s96-c',
        )
