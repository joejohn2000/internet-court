from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.user_register, name='user-register'),
    path('login/', views.user_login, name='user-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin-login/', views.admin_login, name='admin-login'),
    path('create-admin/', views.create_admin, name='create-admin'),
    path('admin-stats/', views.admin_stats, name='admin-stats'),
    path('logout/', views.user_logout, name='user-logout'),
]
