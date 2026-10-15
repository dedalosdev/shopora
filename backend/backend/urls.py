"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from accounts.views import RegisterView, AddressViewSet, ProfileView
from cart.views import CartView, CartItemViewSet
from catalog.views import CategoryViewSet, ProductViewSet, ProductVariantViewSet
from common.views import HealthView
from coupons.views import CouponViewSet, CouponValidateView
from inventory.views import InventoryViewSet, InventoryMovementViewSet
from notifications.views import NotificationViewSet
from orders.views import OrderViewSet
from payments.views import PaymentViewSet, PaymentWebhookView
from shipping.views import ShipmentViewSet
from storefront.views import StoreSettingView, BannerViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("products", ProductViewSet, basename="product")
router.register("variants", ProductVariantViewSet, basename="variant")
router.register("inventory", InventoryViewSet, basename="inventory")
router.register("inventory-movements", InventoryMovementViewSet, basename="inventory-movement")
router.register("cart/items", CartItemViewSet, basename="cart-item")
router.register("orders", OrderViewSet, basename="order")
router.register("payments", PaymentViewSet, basename="payment")
router.register("shipments", ShipmentViewSet, basename="shipment")
router.register("coupons", CouponViewSet, basename="coupon")
router.register("notifications", NotificationViewSet, basename="notification")
router.register("banners", BannerViewSet, basename="banner")

urlpatterns = [
    path("admin/", admin.site.urls), 
    path("api/v1/health/", HealthView.as_view()),
    path("api/v1/auth/register/", RegisterView.as_view()), 
    path("api/v1/auth/token/", TokenObtainPairView.as_view()),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view()), 
    path("api/v1/auth/me/", ProfileView.as_view()),
    path("api/v1/addresses/", AddressViewSet.as_view({"get":"list","post":"create"})),
    path("api/v1/addresses/<int:pk>/", AddressViewSet.as_view({"get":"retrieve","patch":"partial_update","put":"update","delete":"destroy"})),
    path("api/v1/cart/", CartView.as_view()), 
    path("api/v1/coupons/validate/", CouponValidateView.as_view()),
    path("api/v1/store/", StoreSettingView.as_view()), 
    path("api/v1/webhooks/payments/<str:provider>/", PaymentWebhookView.as_view()),
    path("api/v1/", include(router.urls)), 
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
]

