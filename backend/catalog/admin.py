from django.contrib import admin
from django.contrib.admin.options import ModelAdmin
from django.utils.html import format_html
from .models import Category, Product, ProductVariant, ProductImage
from .forms import CategoryForm, ProductForm


class CategoryAdmin(ModelAdmin):
    form = CategoryForm


class ProductAdmin(ModelAdmin):
    form = ProductForm
    

class ProductImageAdmin(ModelAdmin):
    list_display = ("product__name", "image_preview")

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit:'
                ' cover; border-radius: 4px;" />',
                obj.image.url,
            )
        return "No image"

    image_preview.short_description = "Product image"
    
    
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ("product__name", "sku", "price")
       
    

    
admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(ProductVariant, ProductVariantAdmin)
admin.site.register(ProductImage, ProductImageAdmin)