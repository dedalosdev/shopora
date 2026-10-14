from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator
from catalog.models import ProductVariant


class Inventory(models.Model):
    variant = models.OneToOneField(ProductVariant, on_delete=models.CASCADE, related_name="inventory")
    quantity_on_hand = models.PositiveIntegerField(default=0)
    quantity_reserved = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory"

    @property
    def quantity_available(self): 
        return max(0, self.quantity_on_hand - self.quantity_reserved)

        
class InventoryMovement(models.Model):

    class MovementType(models.TextChoices): 
        RECEIPT="receipt","Receipt"; SALE="sale","Sale"; RESERVATION="reservation","Reservation"; RELEASE="release","Release"; ADJUSTMENT="adjustment","Adjustment"; RETURN="return","Return"

    variant = models.ForeignKey(ProductVariant, on_delete=models.PROTECT, related_name="inventory_movements")
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta: 
        db_table = "inventory_movement"
        ordering = ["-created_at"]