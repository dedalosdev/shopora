from django.utils import timezone
from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Coupon
from .serializers import CouponSerializer


class CouponViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAdminUser]

    
class CouponValidateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        code = str(request.data.get("code", "")).strip().upper()
        try: coupon = Coupon.objects.get(code=code, is_active=True)
        except Coupon.DoesNotExist: raise ValidationError({"code":"Coupon is invalid."})
        now = timezone.now()
        if coupon.starts_at and coupon.starts_at > now: raise ValidationError({"code":"Coupon is not active yet."})
        if coupon.expires_at and coupon.expires_at < now: raise ValidationError({"code":"Coupon has expired."})
        if coupon.usage_limit is not None and coupon.usage_count >= coupon.usage_limit: raise ValidationError({"code":"Coupon usage limit has been reached."})
        return Response({"valid":True,"coupon":CouponSerializer(coupon).data,"message":"Coupon is valid. Discount must be calculated and applied server-side during order creation."})