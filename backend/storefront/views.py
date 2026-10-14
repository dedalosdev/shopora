from django.utils import timezone
from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.generics import RetrieveAPIView
from .models import StoreSetting, Banner
from .serializers import StoreSettingSerializer, BannerSerializer


class StoreSettingView(RetrieveAPIView):
    serializer_class = StoreSettingSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        return StoreSetting.objects.first() or StoreSetting.objects.create()


class BannerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BannerSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Banner.objects.filter(is_active=True)

    def get_queryset(self):
        now = timezone.now(); qs = super().get_queryset()
        return qs.filter((Q(starts_at__isnull=True) | Q(starts_at__lte=now)) & (Q(ends_at__isnull=True) | Q(ends_at__gte=now)))