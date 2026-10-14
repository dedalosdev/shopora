from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):

    class Meta: 
        model = Notification
        fields = ["id","channel","title","message","data","is_read","sent_at","created_at"]
        read_only_fields = ["id","channel","title","message","data","sent_at","created_at"]
    