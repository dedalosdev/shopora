from rest_framework import permissions, viewsets
from .models import Shipment
from .serializers import ShipmentSerializer


class ShipmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Shipment.objects.select_related("order")

    def get_queryset(self):
        qs = super().get_queryset()
        return qs if self.request.user.is_staff else qs.filter(order__user=self.request.user)