from django import forms

from .models import Category, Product


class CategoryForm(forms.ModelForm):
    name = forms.CharField(required=True)
    description = forms.CharField(required=False, widget=forms.Textarea)
    is_active = forms.BooleanField(required=False)
    sort_order = forms.IntegerField(required=False)
    
    class Meta:
        model = Category
        fields = ("name", "description", "parent", "is_active", "sort_order",)


class ProductForm(forms.ModelForm):
    category = forms.ModelChoiceField(queryset=Category.objects.all().order_by("name"), required=True)
    name = forms.CharField(required=True)
    description = forms.CharField(required=False, widget=forms.Textarea)
    is_active = forms.BooleanField(required=False)
    sort_order = forms.IntegerField(required=False)
    
    class Meta:
        model = Product
        fields = ("category", "name", "description", "is_active", "is_featured",)


