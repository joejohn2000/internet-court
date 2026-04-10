from django.contrib.auth import get_user_model, authenticate, login
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from apps.feedback.models import Feedback

from .auth import get_user_response


@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def admin_login(request):
    """Login for admin users only."""
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not (user.is_staff or user.is_superuser):
        return Response({'error': 'Admin access only.'}, status=status.HTTP_403_FORBIDDEN)

    login(request, user)
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_admin': True,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def create_admin(request):
    """
    Create a new admin account.
    """
    User = get_user_model()
    # Authorise the caller first
    admin_username = request.data.get('admin_username', '').strip()
    admin_password = request.data.get('admin_password', '').strip()
    caller = authenticate(request, username=admin_username, password=admin_password)
    if caller is None or not (caller.is_staff or caller.is_superuser):
        return Response({'error': 'Invalid admin credentials.'}, status=status.HTTP_403_FORBIDDEN)

    # Create new admin
    new_username = request.data.get('new_username', '').strip()
    new_password = request.data.get('new_password', '').strip()
    new_email = request.data.get('new_email', '').strip()

    if not new_username or not new_password:
        return Response({'error': 'new_username and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=new_username).exists():
        return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    if new_email and User.objects.filter(email=new_email).exists():
        return Response({'error': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    new_admin = get_user_model().objects.create_superuser(
        username=new_username,
        password=new_password,
        email=new_email or '',
    )
    return Response({
        'id': new_admin.id,
        'username': new_admin.username,
        'email': new_admin.email,
        'is_admin': True,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def admin_stats(request):
    """Stats visible in the admin dashboard."""
    feedback_count = Feedback.objects.count()
    from apps.cases.models import Case
    from apps.votes.models import Vote
    users = [get_user_response(u) for u in get_user_model().objects.all().order_by('-id')]
    
    return Response({
        'feedback_count': feedback_count,
        'cases_count': Case.objects.count(),
        'votes_count': Vote.objects.count(),
        'users_count': len(users),
        'users': users
    })
