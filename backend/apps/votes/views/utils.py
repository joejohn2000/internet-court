from core.request import get_client_ip



def get_voter(request):
    """Identify the voter account if logged in."""
    if request.user and request.user.is_authenticated:
        return request.user
    return None
