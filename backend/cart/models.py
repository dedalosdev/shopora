from django.conf import settings
from django.db import models
from catalog.models import ProductVariant


class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name="carts")
    session_key = models.CharField(max_length=100, blank=True, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cart"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta: 
        db_table ="cart_item"
        constraints = [models.UniqueConstraint(fields=["cart","variant"], name="unique_variant_per_cart")]

    @property
    def line_total(self):
        return self.variant.price * self.quantity