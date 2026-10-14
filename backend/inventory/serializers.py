from rest_framework import serializers
from .models import Inventory, InventoryMovement


class InventorySerializer(serializers.ModelSerializer):
    variant_sku = serializers.CharField(source="variant.sku", read_only=True)
    quantity_available = serializers.IntegerField(read_only=True)

    class Meta: 
        model = Inventory
        fields = ["id","variant","variant_sku","quantity_on_hand","quantity_reserved","quantity_available","updated_at"]

        
class InventoryMovementSerializer(serializers.ModelSerializer):

    class Meta: 
        model = InventoryMovement
        fields = "__all__"; read_only_fields = ["created_by","created_at"]