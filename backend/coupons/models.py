from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator


class Coupon(models.Model):

    class DiscountType(models.TextChoices): 
        PERCENTAGE="percentage","Percentage"; FIXED="fixed","Fixed amount"
        
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    value = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    minimum_order_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    starts_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "coupon"

    def __str__(self): 
        return self.code


class CouponRedemption(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.PROTECT, related_name="redemptions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    order = models.ForeignKey("orders.Order", on_delete=models.PROTECT)
    redeemed_at = models.DateTimeField(auto_now_add=True)

    class Meta: 
        db_table = "coupon_rendemption"
        constraints = [models.UniqueConstraint(fields=["coupon","order"], name="unique_coupon_redemption_per_order")]