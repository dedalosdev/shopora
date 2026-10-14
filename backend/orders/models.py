from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator

class Order(models.Model):

    class Status(models.TextChoices): 
        PENDING_PAYMENT="pending_payment","Pending payment"
        PAID="paid","Paid"
        PROCESSING="processing","Processing"
        SHIPPED="shipped","Shipped"
        DELIVERED="delivered","Delivered"
        CANCELLED="cancelled","Cancelled"
        REFUNDED="refunded","Refunded"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders")
    number = models.CharField(max_length=32, unique=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING_PAYMENT)
    recipient_name = models.CharField(max_length=150)
    shipping_address = models.JSONField(default=dict)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=50, blank=True)
    customer_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta: 
        db_table = "status"
        ordering = ["-created_at"]

    def __str__(self): 
        return self.number

        
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    variant = models.ForeignKey("catalog.ProductVariant", null=True, blank=True, on_delete=models.SET_NULL)
    product_name = models.CharField(max_length=200)
    sku = models.CharField(max_length=80)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "order_item"