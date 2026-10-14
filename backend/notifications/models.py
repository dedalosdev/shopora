from django.db import models
from django.conf import settings


class Notification(models.Model):

    class Channel(models.TextChoices): 
        EMAIL="email","Email"
        SMS="sms","SMS"
        PUSH="push","Push"
        WHATSAPP="whatsapp","WhatsApp"
        IN_APP="in_app","In app"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    channel = models.CharField(max_length=20, choices=Channel.choices, default=Channel.IN_APP)
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta: 
        db_table = "notification"
        ordering = ["-created_at"]