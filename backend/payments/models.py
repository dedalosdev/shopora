from django.db import models
from orders.models import Order

class Payment(models.Model):

    class Status(models.TextChoices): 
        PENDING="pending","Pending"
        PROCESSING="processing","Processing"
        PAID="paid","Paid"
        FAILED="failed","Failed"
        CANCELLED="cancelled","Cancelled"; REFUNDED="refunded","Refunded"

    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name="payments")
    provider = models.CharField(max_length=40)
    external_id = models.CharField(max_length=200, blank=True, db_index=True)
    method = models.CharField(max_length=30, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    checkout_url = models.URLField(blank=True)
    provider_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payment"


class PaymentEvent(models.Model):
    payment = models.ForeignKey(Payment, null=True, blank=True, on_delete=models.SET_NULL, related_name="events")
    provider = models.CharField(max_length=40)
    event_id = models.CharField(max_length=200, unique=True)
    event_type = models.CharField(max_length=100)
    payload = models.JSONField(default=dict)
    processed_at = models.DateTimeField(null=True, blank=True)
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "payment_event"