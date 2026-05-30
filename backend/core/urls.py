from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from apps.cases.views import CaseViewSet, CategoryViewSet, CommentViewSet
from apps.votes.views import VoteViewSet
from apps.feedback.views import FeedbackViewSet
from .views import healthz, loaderio_verification

router = routers.DefaultRouter()
router.register(r'cases', CaseViewSet, basename='case')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'votes', VoteViewSet)
router.register(r'feedback', FeedbackViewSet)
router.register(r'comments', CommentViewSet, basename='comment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('healthz/', healthz, name='healthz'),
    path(
        'loaderio-c1662272c97d116ce75d84609b5d965c.txt',
        loaderio_verification,
        {'token': 'loaderio-c1662272c97d116ce75d84609b5d965c'},
        name='loaderio-verification',
    ),
    path(
        'loaderio-c606583dc7b0df48d25cfa7ef125d863.txt',
        loaderio_verification,
        {'token': 'loaderio-c606583dc7b0df48d25cfa7ef125d863'},
        name='loaderio-verification-render',
    ),
    path('api/users/', include('apps.users.urls')),
    path('api/', include(router.urls)),
]
