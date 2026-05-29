from django.contrib import admin
from .models import PSQIResponse

@admin.register(PSQIResponse)
class PSQIResponseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "age",
        "gender",
        "total_score",
        "created_at",
    )
    search_fields = ("name",)
    list_filter = ("gender", "created_at")