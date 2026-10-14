from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Address

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name", "phone_number"]
    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)

        
class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "phone_number"]
        read_only_fields = ["id", "email"]


class AddressSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Address
        exclude = ["user"]
        read_only_fields = ["id", "created_at"]