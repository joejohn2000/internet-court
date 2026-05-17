from django.conf import settings
from django.core.cache import cache
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response
from apps.cases.models import Category
from apps.cases.serializers import CategorySerializer


CATEGORY_LIST_CACHE_KEY = 'categories:list:v1'


class CategoryViewSet(mixins.CreateModelMixin,
                      mixins.RetrieveModelMixin,
                      mixins.UpdateModelMixin,
                      mixins.DestroyModelMixin,
                      mixins.ListModelMixin,
                      viewsets.GenericViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def _clear_category_cache(self):
        cache.delete(CATEGORY_LIST_CACHE_KEY)

    def list(self, request, *args, **kwargs):
        cached_payload = cache.get(CATEGORY_LIST_CACHE_KEY)
        if cached_payload is not None:
            return Response(cached_payload)

        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        payload = serializer.data
        cache.set(CATEGORY_LIST_CACHE_KEY, payload, settings.CACHE_CATEGORIES_SECONDS)
        return Response(payload)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code < status.HTTP_400_BAD_REQUEST:
            self._clear_category_cache()
        return response

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        if response.status_code < status.HTTP_400_BAD_REQUEST:
            self._clear_category_cache()
        return response

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        if response.status_code < status.HTTP_400_BAD_REQUEST:
            self._clear_category_cache()
        return response

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        if response.status_code < status.HTTP_400_BAD_REQUEST:
            self._clear_category_cache()
        return response
