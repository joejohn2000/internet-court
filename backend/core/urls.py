from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from apps.cases.views import CaseViewSet, CategoryViewSet
from apps.votes.views import VoteViewSet
from apps.feedback.views import FeedbackViewSet

router = routers.DefaultRouter()
router.register(r'cases', CaseViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'votes', VoteViewSet)
router.register(r'feedback', FeedbackViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/users/', include('apps.users.urls')),
]
