from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):

    class Meta: 
        model = Coupon
        fields = ["id","code","discount_type","value","minimum_order_amount","starts_at","expires_at","usage_limit","usage_count","is_active"]