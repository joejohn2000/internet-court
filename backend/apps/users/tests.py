from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.test import APITestCase


class UserSecurityTests(APITestCase):
    def setUp(self):
        self.user_model = get_user_model()
        self.admin = self.user_model.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='AdminPass123!',
        )
        self.user = self.user_model.objects.create_user(
            username='citizen',
            email='citizen@example.com',
            password='CitizenPass123!',
        )

    def authenticate(self, user):
        token = AccessToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_create_admin_requires_authenticated_admin(self):
        self.authenticate(self.user)

        response = self.client.post(
            '/api/users/create-admin/',
            {
                'new_username': 'new-admin',
                'new_password': 'NewAdminPass123!',
                'new_email': 'new-admin@example.com',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(self.user_model.objects.filter(username='new-admin').exists())

    def test_admin_stats_does_not_mint_tokens_for_other_users(self):
        self.authenticate(self.admin)

        response = self.client.get('/api/users/admin-stats/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('users', response.data)
        self.assertGreaterEqual(len(response.data['users']), 2)
        self.assertNotIn('access', response.data['users'][0])
        self.assertNotIn('refresh', response.data['users'][0])
