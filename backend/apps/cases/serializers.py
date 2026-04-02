from rest_framework import serializers
from .models import Case, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class CaseSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    author_name = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Case
        fields = [
            'id', 'author_name', 'category', 'category_id', 
            'title_hook', 'ai_suggested_hook', 'full_story', 
            'status', 'verdict_timer_ends', 'created_at'
        ]
        read_only_fields = ['status', 'verdict_timer_ends', 'ai_suggested_hook']
