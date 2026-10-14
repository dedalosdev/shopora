from django.db import models

class StoreSetting(models.Model):
    store_name = models.CharField(max_length=150, default="My Store")
    tagline = models.CharField(max_length=200, blank=True)
    support_email = models.EmailField(blank=True)
    support_phone = models.CharField(max_length=40, blank=True)
    currency = models.CharField(max_length=3, default="BRL")
    is_open = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "store_setting"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


class Banner(models.Model):
    title = models.CharField(max_length=150)
    subtitle = models.CharField(max_length=250, blank=True)
    image = models.ImageField(upload_to="banners/")
    target_url = models.CharField(max_length=300, blank=True)
    position = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["position"]
        db_table = "banner"
        
        