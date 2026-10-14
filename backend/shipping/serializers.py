from rest_framework import serializers
from .models import Shipment


class ShipmentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source="order.number", read_only=True)

    class Meta: 
        model = Shipment
        fields = "__all__"