from rest_framework import generics, permissions, viewsets
from .serializers import RegisterSerializer, ProfileSerializer, AddressSerializer
from .models import Address


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self): 
        return self.request.user


class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self): 
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer): 
        serializer.save(user=self.request.user)