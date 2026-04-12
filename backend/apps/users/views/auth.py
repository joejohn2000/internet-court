from django.contrib.auth import get_user_model, authenticate, login
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


def get_user_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_admin': user.is_staff or user.is_superuser,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }


@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
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
    
    # HISTORY MIGRATION: Connect anonymous IP-based history to this new account
    try:
        x_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_for.split(',')[0].strip() if x_for else request.META.get('REMOTE_ADDR')
        
        from apps.cases.models import Case
        from apps.votes.models import Vote
        
        Case.objects.filter(ip_address=ip, author__isnull=True).update(author=user)
        Vote.objects.filter(ip_address=ip, voter__isnull=True).update(voter=user)
    except Exception as e:
        print(f"History migration failed: {e}")

    login(request, user)
    return Response(get_user_response(user), status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def user_login(request):
    """Login for normal users – returns basic user info."""
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    login(request, user)
    return Response(get_user_response(user))


@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def user_logout(request):
    """Terminates the session on the backend."""
    from django.contrib.auth import logout
    logout(request)
    return Response({'status': 'Logged out.'}, status=status.HTTP_200_OK)
