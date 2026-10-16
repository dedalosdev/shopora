from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source="order.number", read_only=True)

    class Meta: 
        model = Payment
        fields = ["id","order","order_number","provider","external_id","method","amount","status","checkout_url","created_at","updated_at"]
        read_only_fields = fields

        
class CheckoutSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    provider = serializers.ChoiceField(choices=[("asaas","Asaas")])
    method = serializers.ChoiceField(choices=[("pix","Pix"),("credit_card","Credit card")])