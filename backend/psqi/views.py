from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import PSQIResponse


@api_view(["POST"])
def submit_psqi(request):
    data = request.data

    total_score = int(data.get("total_score", 0))

    PSQIResponse.objects.create(
        name=data.get("name", ""),
        age=data.get("age") or None,
        gender=data.get("gender", ""),

        q1_bedtime=data.get("q1_bedtime", ""),
        q2_sleep_latency_minutes=data.get("q2_sleep_latency_minutes") or None,
        q3_wakeup_time=data.get("q3_wakeup_time", ""),
        q4_sleep_hours=data.get("q4_sleep_hours") or None,

        sleep_quality=int(data.get("sleep_quality", 0)),
        sleep_latency=int(data.get("sleep_latency", 0)),
        sleep_duration=int(data.get("sleep_duration", 0)),
        sleep_efficiency=int(data.get("sleep_efficiency", 0)),
        sleep_disturbance=int(data.get("sleep_disturbance", 0)),
        sleeping_medication=int(data.get("sleeping_medication", 0)),
        daytime_dysfunction=int(data.get("daytime_dysfunction", 0)),

        total_score=total_score,
    )

    result = "睡眠品質良好" if total_score <= 5 else "睡眠品質較差，建議注意睡眠狀況"

    return Response({
        "message": "success",
        "total_score": total_score,
        "result": result
    })


@api_view(["GET"])
def list_psqi(request):
    records = PSQIResponse.objects.all().order_by("-created_at")

    data = []

    for r in records:
        data.append({
            "id": r.id,
            "name": r.name,
            "age": r.age,
            "gender": r.gender,
            "q1_bedtime": r.q1_bedtime,
            "q2_sleep_latency_minutes": r.q2_sleep_latency_minutes,
            "q3_wakeup_time": r.q3_wakeup_time,
            "q4_sleep_hours": r.q4_sleep_hours,
            "sleep_quality": r.sleep_quality,
            "sleep_latency": r.sleep_latency,
            "sleep_duration": r.sleep_duration,
            "sleep_efficiency": r.sleep_efficiency,
            "sleep_disturbance": r.sleep_disturbance,
            "sleeping_medication": r.sleeping_medication,
            "daytime_dysfunction": r.daytime_dysfunction,
            "total_score": r.total_score,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M"),
        })

    return Response(data)