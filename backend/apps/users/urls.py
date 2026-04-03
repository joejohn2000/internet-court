from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.user_register, name='user-register'),
    path('login/', views.user_login, name='user-login'),
    path('admin-login/', views.admin_login, name='admin-login'),
    path('create-admin/', views.create_admin, name='create-admin'),
    path('admin-stats/', views.admin_stats, name='admin-stats'),
]
