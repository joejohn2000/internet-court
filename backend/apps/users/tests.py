import os

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from apps.users.models import UserProfile


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
        self.client.force_authenticate(user=user)

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

    @patch.dict(os.environ, {'GOOGLE_CLIENT_ID': 'google-client-id.apps.googleusercontent.com'})
    @patch('apps.users.views.auth.id_token')
    @patch('apps.users.views.auth.GoogleRequest')
    def test_google_login_creates_user_from_verified_email(self, google_request_cls, id_token_module):
        google_request_cls.return_value = object()
        id_token_module.verify_oauth2_token.return_value = {
            'iss': 'https://accounts.google.com',
            'email': 'google-user@example.com',
            'email_verified': True,
            'name': 'Google User',
            'given_name': 'Google',
            'family_name': 'User',
            'picture': 'https://lh3.googleusercontent.com/a/test-photo=s96-c',
        }

        response = self.client.post(
            '/api/users/google-login/',
            {
                'credential': 'signed-google-jwt',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'google-user@example.com')
        self.assertEqual(response.data['profile_image'], 'https://lh3.googleusercontent.com/a/test-photo=s96-c')
        created_user = self.user_model.objects.get(email='google-user@example.com')
        created_profile = UserProfile.objects.get(user=created_user)
        self.assertEqual(created_profile.display_name, 'Google User')
        self.assertEqual(created_profile.profile_image, 'https://lh3.googleusercontent.com/a/test-photo=s96-c')
        self.assertFalse(created_user.has_usable_password())

    @patch.dict(os.environ, {'GOOGLE_CLIENT_ID': 'google-client-id.apps.googleusercontent.com'})
    @patch('apps.users.views.auth.id_token')
    @patch('apps.users.views.auth.GoogleRequest')
    def test_google_login_rejects_unverified_email(self, google_request_cls, id_token_module):
        google_request_cls.return_value = object()
        id_token_module.verify_oauth2_token.return_value = {
            'iss': 'https://accounts.google.com',
            'email': 'unverified@example.com',
            'email_verified': False,
        }

        response = self.client.post(
            '/api/users/google-login/',
            {
                'credential': 'signed-google-jwt',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
