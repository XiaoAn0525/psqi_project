from django.db import models

class PSQIResponse(models.Model):
    name = models.CharField(max_length=50, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)

    q1_bedtime = models.CharField(max_length=10, blank=True)
    q2_sleep_latency_minutes = models.IntegerField(null=True, blank=True)
    q3_wakeup_time = models.CharField(max_length=10, blank=True)
    q4_sleep_hours = models.FloatField(null=True, blank=True)

    sleep_quality = models.IntegerField()
    sleep_latency = models.IntegerField()
    sleep_duration = models.IntegerField()
    sleep_efficiency = models.IntegerField()
    sleep_disturbance = models.IntegerField()
    sleeping_medication = models.IntegerField()
    daytime_dysfunction = models.IntegerField()

    total_score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - PSQI {self.total_score}"