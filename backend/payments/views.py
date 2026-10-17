from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from orders.models import Order
from .models import Payment, PaymentEvent
from .serializers import PaymentSerializer, CheckoutSerializer
from .asaas import AsaasError, create_asaas_checkout, create_asaas_customer, find_asaas_customer_by_email


from .asaas import (
    AsaasError,
    create_asaas_checkout,
    create_asaas_customer,
    find_asaas_customer_by_email,
)
from .models import Payment
from .serializers import (
    CheckoutSerializer,
    PaymentSerializer,
)

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "head", "options",]

    def get_queryset(self):
        queryset = Payment.objects.select_related("order")

        if self.request.user.is_staff:
            return queryset

        return queryset.filter(order__user=self.request.user)

    def create(self, request, *args, **kwargs):
        data = CheckoutSerializer(
            data=request.data
        )

        data.is_valid(raise_exception=True)

        try:
            order = (
                Order.objects
                .prefetch_related("items")
                .get(
                    pk=data.validated_data["order_id"],
                    user=request.user,
                )
            )
        except Order.DoesNotExist:
            raise ValidationError({
                "order_id": "Order was not found."
            })

        if order.status != Order.Status.PENDING_PAYMENT:
            raise ValidationError({
                "order": "Order is not awaiting payment."
            })

        if data.validated_data["provider"] != "asaas":
            raise ValidationError({
                "provider": "Only Asaas is supported."
            })

        method = data.validated_data["method"]

        try:
            # 1. Search for existing customer on Asaas
            customer = find_asaas_customer_by_email(
                request.user.email
            )

            # 2. Create customer if it does not yet exist
            if not customer:
                customer = create_asaas_customer(
                    name=(
                        request.user.get_full_name()
                        or request.user.email
                    ),
                    email=request.user.email,
                    external_reference=str(
                        request.user.id
                    ),
                )

            # 3. Create a Checkout in Asaas
            checkout = create_asaas_checkout(
                customer_id=customer["id"],
                order=order,
                method=method,
            )

            checkout_id = checkout["id"]

            checkout_url = checkout.get("url")

            if not checkout_url:
                checkout_url = (
                    "https://asaas.com/"
                    "checkoutSession/show"
                    f"?id={checkout_id}"
                )

        except AsaasError as exc:
            raise ValidationError({
                "payment": str(exc)
            })

        # 4. Create a local record of the payment
        payment = Payment.objects.create(
            order=order,
            provider="asaas",
            method=method,
            amount=order.total,
            external_id=checkout_id,
            checkout_url=checkout_url,
            status="pending",
        )

        return Response(
            {
                "message": "Asaas checkout created.",
                "payment": PaymentSerializer(
                    payment
                ).data,
            },
            status=status.HTTP_201_CREATED,
        )

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