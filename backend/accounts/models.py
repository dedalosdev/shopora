from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=30, blank=True)
    is_customer = models.BooleanField(default=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
        
    def __str__(self): 
        return self.email


class Address(models.Model):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField(max_length=50, blank=True)
    recipient_name = models.CharField(max_length=150)
    postal_code = models.CharField(max_length=20)
    street = models.CharField(max_length=200)
    number = models.CharField(max_length=30)
    complement = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=2, default="BR")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta: 
        ordering = ["-is_default", "-created_at"]
        db_table = 'address'
        
    def __str__(self): 
        return f"{self.street}, {self.number} - {self.city}"