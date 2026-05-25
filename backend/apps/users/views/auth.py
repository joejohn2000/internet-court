import os

from django.contrib.auth import authenticate, get_user_model
from django.utils.text import slugify
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

try:
    from rest_framework_simplejwt.tokens import AccessToken
except ImportError:  # pragma: no cover - local fallback for incomplete dev envs
    AccessToken = None

try:
    from google.auth.transport.requests import Request as GoogleRequest
    from google.oauth2 import id_token
except ImportError:  # pragma: no cover - local fallback for incomplete dev envs
    GoogleRequest = None
    id_token = None

from core.request import get_client_ip
from core.throttles import GoogleLoginRateThrottle, LoginRateThrottle, RegisterRateThrottle


def build_unique_username(user_model, raw_username):
    base_username = slugify(raw_username).replace('-', '_')[:24] or 'google_user'
    candidate = base_username
    suffix = 1

    while user_model.objects.filter(username=candidate).exists():
        suffix += 1
        candidate = f'{base_username[:20]}_{suffix}'

    return candidate


def migrate_anonymous_history(user, request):
    ip = get_client_ip(request)
    if not ip:
        return

    from apps.cases.models import Case
    from apps.votes.models import Vote

    Case.objects.filter(ip_address=ip, author__isnull=True).update(author=user)
    Vote.objects.filter(ip_address=ip, voter__isnull=True).update(voter=user)


def get_google_client_id():
    return os.getenv('GOOGLE_CLIENT_ID', '').strip()


def get_user_response(user, profile_image=None):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_admin': user.is_staff or user.is_superuser,
        'access': str(AccessToken.for_user(user)) if AccessToken else '',
        'profile_image': profile_image or '',
    }


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([RegisterRateThrottle])
def user_register(request):
    """Register a new normal user."""
    User = get_user_model()
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()
    email = request.data.get('email', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)

    if email and User.objects.filter(email=email).exists():
        return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    user = get_user_model().objects.create_user(username=username, password=password, email=email)
    
    try:
        migrate_anonymous_history(user, request)
    except Exception as e:
        print(f"History migration failed: {e}")

    return Response(get_user_response(user), status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def user_login(request):
    """Login for normal users – returns basic user info."""
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    return Response(get_user_response(user))


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([GoogleLoginRateThrottle])
def google_login(request):
    """Authenticate or create a user from a Google ID token."""
    if not id_token or not GoogleRequest:
        return Response({'error': 'Google sign-in is not available on this server.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    credential = request.data.get('credential', '').strip()
    google_client_id = get_google_client_id()

    if not google_client_id:
        return Response({'error': 'Google sign-in is not configured on this server.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    if not credential:
        return Response({'error': 'Google credential is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        id_info = id_token.verify_oauth2_token(credential, GoogleRequest(), google_client_id)
    except Exception:
        return Response({'error': 'Google token verification failed.'}, status=status.HTTP_401_UNAUTHORIZED)

    if id_info.get('iss') not in {'accounts.google.com', 'https://accounts.google.com'}:
        return Response({'error': 'Invalid Google issuer.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not id_info.get('email_verified'):
        return Response({'error': 'Your Google account email must be verified.'}, status=status.HTTP_400_BAD_REQUEST)

    email = (id_info.get('email') or '').strip().lower()
    if not email:
        return Response({'error': 'Google account did not provide an email address.'}, status=status.HTTP_400_BAD_REQUEST)

    user_model = get_user_model()
    user = user_model.objects.filter(email__iexact=email).first()

    if user is None:
        profile_name = (id_info.get('name') or email.split('@')[0]).strip()
        username = build_unique_username(user_model, profile_name)
        user = user_model.objects.create_user(
            username=username,
            email=email,
            first_name=(id_info.get('given_name') or '').strip(),
            last_name=(id_info.get('family_name') or '').strip(),
        )
        user.set_unusable_password()
        user.save(update_fields=['password'])
    else:
        fields_to_update = []
        if not user.first_name and id_info.get('given_name'):
            user.first_name = id_info['given_name'].strip()
            fields_to_update.append('first_name')
        if not user.last_name and id_info.get('family_name'):
            user.last_name = id_info['family_name'].strip()
            fields_to_update.append('last_name')
        if fields_to_update:
            user.save(update_fields=fields_to_update)

    try:
        migrate_anonymous_history(user, request)
    except Exception as e:
        print(f"Google history migration failed: {e}")

    picture = (id_info.get('picture') or '').strip()
    if picture:
        try:
            from apps.cases.models import Case
            Case.objects.filter(author=user).exclude(author_profile_image=picture).update(author_profile_image=picture)
        except Exception as e:
            print(f"Google case profile sync failed: {e}")

    return Response(get_user_response(user, profile_image=picture), status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def user_logout(request):
    """JWT logout is handled client-side."""
    return Response({'status': 'Logged out.'}, status=status.HTTP_200_OK)
