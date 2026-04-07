from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from apps.cases.views import CaseViewSet, CategoryViewSet, CommentViewSet
from apps.votes.views import VoteViewSet
from apps.feedback.views import FeedbackViewSet

router = routers.DefaultRouter()
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'votes', VoteViewSet)
router.register(r'feedback', FeedbackViewSet)
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/', include(router.urls)),
]
