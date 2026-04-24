from rest_framework import status
from rest_framework.test import APITestCase


class FeedbackPermissionsTests(APITestCase):
    def test_public_feedback_listing_is_blocked(self):
        response = self.client.get('/api/feedback/')
        self.assertIn(response.status_code, {status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN})

    def test_public_feedback_submission_is_allowed(self):
        response = self.client.post(
            '/api/feedback/',
            {
                'feedback_type': 'bug',
                'message': 'The mobile layout overlaps on the home page.',
                'email': 'juror@example.com',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
