from django.contrib import admin

from .models import (
    PSQIResponse,
    MetabolicScreening,
)


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

    list_filter = (
        "gender",
        "created_at",
    )

    search_fields = (
        "name",
    )

    ordering = (
        "-created_at",
    )


@admin.register(MetabolicScreening)
class MetabolicScreeningAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "age",
        "gender",
        "bmi",
        "sleep_hours",
        "smoking",
        "exercise",
        "waist",
        "risk_level",
        "created_at",
    )

    list_filter = (
        "gender",
        "smoking",
        "exercise",
        "alcohol",
        "betel_nut",
        "diet",
        "risk_level",
        "created_at",
    )

    search_fields = (
        "risk_level",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )