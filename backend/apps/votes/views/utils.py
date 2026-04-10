from django.contrib.auth import get_user_model


def get_client_ip(request):
    """Detects the real IP address of the client."""
    x_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_for:
        return x_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def get_voter(request):
    """Identify the voter account if logged in (optional)."""
    if request.user and request.user.is_authenticated:
        return request.user
    
    user_id = request.headers.get('X-User-Id') or request.META.get('HTTP_X_USER_ID')
    if user_id:
        try:
            return get_user_model().objects.get(id=int(user_id))
        except (ValueError, TypeError, get_user_model().DoesNotExist):
            pass
    return None
