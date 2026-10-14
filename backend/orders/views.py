import uuid
from decimal import Decimal
from django.db import transaction
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from accounts.models import Address
from cart.models import Cart
from inventory.models import Inventory, InventoryMovement
from .models import Order, OrderItem
from .serializers import OrderSerializer, CreateOrderSerializer

class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Order.objects.prefetch_related("items")
        return queryset if self.request.user.is_staff else queryset.filter(user=self.request.user)

    @action(detail=False, methods=["post"], url_path="create-from-cart")
    def create_from_cart(self, request):
        input_serializer = CreateOrderSerializer(data=request.data); input_serializer.is_valid(raise_exception=True)
        try: 
            address = Address.objects.get(pk=input_serializer.validated_data["address_id"], user=request.user)
        except Address.DoesNotExist: 
            raise ValidationError({"address_id":"Address was not found."})

        with transaction.atomic():
            cart = Cart.objects.filter(user=request.user, is_active=True).first()
            if not cart: 
                raise ValidationError({"cart":"Your cart is empty."})

            cart_items = list(cart.items.select_related("variant","variant__product").all())
            
            if not cart_items: 
                raise ValidationError({"cart":"Your cart is empty."})
                
            subtotal = Decimal("0.00")
            locked_inventory = {}
            for item in cart_items:
                if not item.variant.is_active or not item.variant.product.is_active: raise ValidationError({"cart":"A product is no longer available."})
                inv = Inventory.objects.select_for_update().filter(variant=item.variant).first()
                if inv and inv.quantity_available < item.quantity: raise ValidationError({"stock":f"Insufficient stock for {item.variant.sku}."})
                locked_inventory[item.id] = inv
                subtotal += item.variant.price * item.quantity

            order = Order.objects.create(user=request.user, number=uuid.uuid4().hex[:16].upper(), recipient_name=address.recipient_name,
                shipping_address={"postal_code":address.postal_code,"street":address.street,"number":address.number,"complement":address.complement,"district":address.district,"city":address.city,"state":address.state,"country":address.country},
                subtotal=subtotal, shipping_amount=Decimal("0.00"), discount_amount=Decimal("0.00"), total=subtotal,
                coupon_code=input_serializer.validated_data.get("coupon_code", ""), customer_notes=input_serializer.validated_data.get("customer_notes", ""))

            for item in cart_items:
                OrderItem.objects.create(order=order, variant=item.variant, product_name=item.variant.product.name, sku=item.variant.sku,
                    quantity=item.quantity, unit_price=item.variant.price, line_total=item.variant.price * item.quantity)
                inv = locked_inventory[item.id]
                if inv:
                    inv.quantity_reserved += item.quantity; inv.save(update_fields=["quantity_reserved","updated_at"])
                    InventoryMovement.objects.create(variant=item.variant, movement_type=InventoryMovement.MovementType.RESERVATION, quantity=item.quantity, reference=order.number, notes="Reserved for order", created_by=request.user)

            cart.items.all().delete(); cart.is_active = False; cart.save(update_fields=["is_active","updated_at"])

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        with transaction.atomic():
            order = self.get_queryset().select_for_update().filter(pk=pk).first()
            if not order: 
                raise ValidationError({"order":"Order was not found."})

            if order.status != Order.Status.PENDING_PAYMENT: 
                raise ValidationError({"status":"Only unpaid orders can be cancelled through this endpoint."})

            for item in order.items.select_related("variant"):
                if item.variant:
                    inv = Inventory.objects.select_for_update().filter(variant=item.variant).first()
                    if inv:
                        inv.quantity_reserved = max(0, inv.quantity_reserved-item.quantity); inv.save(update_fields=["quantity_reserved","updated_at"])
                        InventoryMovement.objects.create(variant=item.variant, movement_type=InventoryMovement.MovementType.RELEASE, quantity=item.quantity, reference=order.number, notes="Reservation released after cancellation", created_by=request.user)

            order.status = Order.Status.CANCELLED; order.save(update_fields=["status","updated_at"])

        return Response(OrderSerializer(order).data)