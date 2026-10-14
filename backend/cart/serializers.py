from rest_framework import serializers
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    sku = serializers.CharField(source="variant.sku", read_only=True)
    unit_price = serializers.DecimalField(source="variant.price", max_digits=12, decimal_places=2, read_only=True)
    line_total = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    
    class Meta: 
        model = CartItem
        fields = ["id","variant","product_name","sku","quantity","unit_price","line_total"]
        read_only_fields = ["id"]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta: 
        model = Cart
        fields = ["id","items","subtotal","updated_at"]

    def get_subtotal(self, obj): 
        return sum((item.line_total for item in obj.items.select_related("variant")), start=0)