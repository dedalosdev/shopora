from rest_framework import permissions, viewsets
from .models import Category, Product, ProductVariant
from .serializers import CategorySerializer, ProductSerializer, ProductVariantSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    queryset = Category.objects.filter(is_active=True).select_related("parent")
    lookup_field = "slug"


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Product.objects.filter(is_active=True).select_related("category").prefetch_related("variants", "images")
    lookup_field = "slug"
    filterset_fields = ["category__slug", "is_featured"]
    search_fields = ["name", "description", "variants__sku"]
    ordering_fields = ["created_at", "name", "variants__price"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == "list" and self.request.query_params.get("featured") == "true":
            queryset = queryset.filter(is_featured=True)
        return queryset


class ProductVariantViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.AllowAny]
    queryset = ProductVariant.objects.filter(is_active=True, product__is_active=True).select_related("product")
    filterset_fields = ["product__slug"]
    search_fields = ["sku", "name"]