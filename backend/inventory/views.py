from rest_framework import permissions, viewsets
from rest_framework.exceptions import PermissionDenied
from .models import Inventory, InventoryMovement
from .serializers import InventorySerializer, InventoryMovementSerializer


class InventoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Inventory.objects.select_related("variant", "variant__product")
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ["variant"]

    
class InventoryMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = InventoryMovement.objects.select_related("variant", "created_by")
    serializer_class = InventoryMovementSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ["variant", "movement_type"]