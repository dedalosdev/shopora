from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):

    class Meta: 
        model = OrderItem
        fields = ["id","product_name","sku","quantity","unit_price","line_total"]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta: 
        model = Order
        fields = ["id","number","status","recipient_name","shipping_address","subtotal","shipping_amount","discount_amount","total","coupon_code","items","created_at","updated_at"]

        
class CreateOrderSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    customer_notes = serializers.CharField(required=False, allow_blank=True)