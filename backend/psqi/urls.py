from django.urls import path

from .views import (
    submit_psqi,
    list_psqi,
    predict_metabolic,
)


urlpatterns = [

    # =========================
    # PSQI 睡眠品質問卷
    # =========================

    path(
        "submit/",
        submit_psqi,
        name="submit_psqi"
    ),

    path(
        "records/",
        list_psqi,
        name="list_psqi"
    ),


    # =========================
    # 代謝症候群風險篩檢
    # =========================

    path(
        "metabolic/predict/",
        predict_metabolic,
        name="predict_metabolic"
    ),

]