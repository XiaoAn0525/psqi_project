"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.urls import path

from psqi.views import (
    submit_psqi,
    list_psqi,
    predict_metabolic,
)


urlpatterns = [

    # =========================
    # Django Admin
    # =========================

    path(
        "admin/",
        admin.site.urls
    ),


    # =========================
    # PSQI 睡眠品質問卷
    # =========================

    path(
        "api/psqi/submit/",
        submit_psqi,
        name="submit_psqi"
    ),

    path(
        "api/psqi/records/",
        list_psqi,
        name="list_psqi"
    ),


    # =========================
    # 代謝症候群風險篩檢
    # =========================

    path(
        "api/metabolic/predict/",
        predict_metabolic,
        name="predict_metabolic"
    ),

]