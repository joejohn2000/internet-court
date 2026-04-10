from rest_framework import serializers
from apps.cases.models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']
        extra_kwargs = {'slug': {'required': False}}

    def validate_slug(self, value):
        if not value:
            from django.utils.text import slugify
            return slugify(self.initial_data.get('name', ''))
        return value

    def create(self, validated_data):
        if not validated_data.get('slug'):
            from django.utils.text import slugify
            validated_data['slug'] = slugify(validated_data.get('name', ''))
        return super().create(validated_data)
