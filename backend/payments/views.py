from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from orders.models import Order
from .models import Payment, PaymentEvent
from .serializers import PaymentSerializer, CheckoutSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        queryset = Payment.objects.select_related("order")
        return queryset if self.request.user.is_staff else queryset.filter(order__user=self.request.user)

    def create(self, request, *args, **kwargs):
        data = CheckoutSerializer(data=request.data); data.is_valid(raise_exception=True)
        try: order = Order.objects.get(pk=data.validated_data["order_id"], user=request.user)
        except Order.DoesNotExist: raise ValidationError({"order_id":"Order was not found."})
        if order.status != Order.Status.PENDING_PAYMENT: raise ValidationError({"order":"Order is not awaiting payment."})
        # Provider-specific checkout creation must be implemented before production.
        payment = Payment.objects.create(order=order, provider=data.validated_data["provider"], method=data.validated_data["method"], amount=order.total)
        return Response({"message":"Payment record created. Configure the provider adapter to create a real checkout.", "payment":PaymentSerializer(payment).data}, status=status.HTTP_201_CREATED)


class PaymentWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def post(self, request, provider):
        # SECURITY TODO: verify provider signature/authentication before trusting this payload.
        payload = request.data
        event_id = payload.get("id") or payload.get("event_id")
        event_type = payload.get("type") or payload.get("event") or "unknown"
        if not event_id: 
            raise ValidationError({"id":"A provider event identifier is required."})

        event, created = PaymentEvent.objects.get_or_create(provider=provider, event_id=str(event_id), defaults={"event_type":str(event_type),"payload":payload})
        if not created: 
            return Response({"received":True,"duplicate":True})
        # Provider-specific event mapping must be implemented and signature verification is mandatory.
        event.processed_at = timezone.now(); event.save(update_fields=["processed_at"])
        return Response({"received":True,"processed":False,"detail":"Provider event mapping is not configured."})