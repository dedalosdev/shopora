from rest_framework import serializers
from .models import Category, Product, ProductVariant, ProductImage


class CategorySerializer(serializers.ModelSerializer):

    class Meta: 
        model = Category
        fields = "__all__"

        
class ProductVariantSerializer(serializers.ModelSerializer):

    class Meta: 
        model = ProductVariant
        fields = ["id","sku","name","attributes","price","compare_at_price","is_active"]

        
class ProductImageSerializer(serializers.ModelSerializer):

    class Meta: 
        model = ProductImage
        fields = ["id","image","alt_text","position"]


class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta: 
        model = Product
        fields = ["id","category","category_name","name","slug","description","is_active","is_featured","variants","images","created_at","updated_at"]