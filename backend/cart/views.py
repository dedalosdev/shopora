from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from catalog.models import ProductVariant
from inventory.models import Inventory
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer

def get_active_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user, is_active=True)
        return cart
    session_key = request.session.session_key
    if not session_key:
        request.session.create(); session_key = request.session.session_key
    cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None, is_active=True)
    return cart


class CartView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request): 
        return Response(CartSerializer(get_active_cart(request)).data)
    
    
class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ["get","post","patch","delete","head","options"]
    
    def get_queryset(self): 
        return CartItem.objects.filter(cart=get_active_cart(self.request)).select_related("variant","variant__product")
        
    def create(self, request, *args, **kwargs):
        variant_id = request.data.get("variant")
        try: 
            quantity = int(request.data.get("quantity", 1))
        except (TypeError, ValueError): 
            raise ValidationError({"quantity":"A valid integer is required."})

        if quantity < 1: 
            raise ValidationError({"quantity":"Quantity must be at least 1."})
        
        try: 
            variant = ProductVariant.objects.get(pk=variant_id, is_active=True, product__is_active=True)
        except ProductVariant.DoesNotExist: 
            raise ValidationError({"variant":"Product variant is unavailable."})

        inventory = Inventory.objects.filter(variant=variant).first()
        if inventory and quantity > inventory.quantity_available: 
            raise ValidationError({"quantity":"Requested quantity is not available."})

        item, created = CartItem.objects.get_or_create(cart=get_active_cart(request), variant=variant, defaults={"quantity":quantity})
        if not created:
            item.quantity += quantity
            if inventory and item.quantity > inventory.quantity_available: 
                raise ValidationError({"quantity":"Requested quantity is not available."})                
            item.save(update_fields=["quantity"])            
        return Response(self.get_serializer(item).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def perform_update(self, serializer):
        quantity = serializer.validated_data.get("quantity", serializer.instance.quantity)
        if quantity < 1: raise ValidationError({"quantity":"Quantity must be at least 1."})
        inventory = Inventory.objects.filter(variant=serializer.instance.variant).first()
        if inventory and quantity > inventory.quantity_available: 
            raise ValidationError({"quantity":"Requested quantity is not available."})
        serializer.save()