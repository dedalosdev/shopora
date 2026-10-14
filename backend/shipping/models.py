from django.db import models
from orders.models import Order


class Shipment(models.Model):

    class Status(models.TextChoices): 
        PENDING="pending","Pending"
        PACKING="packing","Packing"
        SHIPPED="shipped","Shipped"
        IN_TRANSIT="in_transit","In transit"
        DELIVERED="delivered","Delivered"
        EXCEPTION="exception","Exception"
    
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="shipment")
    carrier = models.CharField(max_length=100, blank=True)
    service_name = models.CharField(max_length=100, blank=True)
    tracking_code = models.CharField(max_length=100, blank=True)
    tracking_url = models.URLField(blank=True)
    shipping_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "shipment"


        