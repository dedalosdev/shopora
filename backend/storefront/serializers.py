from rest_framework import serializers
from .models import StoreSetting, Banner

class StoreSettingSerializer(serializers.ModelSerializer):

    class Meta: 
        model = StoreSetting
        fields = ["store_name","tagline","support_email","support_phone","currency","is_open"]

        
class BannerSerializer(serializers.ModelSerializer):

    class Meta: model = Banner
    fields = ["id","title","subtitle","image","target_url","position","starts_at","ends_at"]