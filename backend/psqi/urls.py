from django.urls import path
from .views import submit_psqi, list_psqi

urlpatterns = [
    path("submit/", submit_psqi),
    path("records/", list_psqi),
]