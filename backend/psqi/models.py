from django.db import models


# =========================================================
# PSQI 睡眠品質問卷
# =========================================================

class PSQIResponse(models.Model):
    name = models.CharField(
        max_length=50,
        blank=True
    )

    age = models.IntegerField(
        null=True,
        blank=True
    )

    gender = models.CharField(
        max_length=20,
        blank=True
    )

    q1_bedtime = models.CharField(
        max_length=10,
        blank=True
    )

    q2_sleep_latency_minutes = models.IntegerField(
        null=True,
        blank=True
    )

    q3_wakeup_time = models.CharField(
        max_length=10,
        blank=True
    )

    q4_sleep_hours = models.FloatField(
        null=True,
        blank=True
    )

    sleep_quality = models.IntegerField()

    sleep_latency = models.IntegerField()

    sleep_duration = models.IntegerField()

    sleep_efficiency = models.IntegerField()

    sleep_disturbance = models.IntegerField()

    sleeping_medication = models.IntegerField()

    daytime_dysfunction = models.IntegerField()

    total_score = models.IntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )


    def __str__(self):
        return (
            f"{self.name} - PSQI {self.total_score}"
        )


    class Meta:
        verbose_name = "PSQI 睡眠品質問卷"
        verbose_name_plural = "PSQI 睡眠品質問卷"


# =========================================================
# 代謝症候群風險篩檢
# =========================================================

class MetabolicScreening(models.Model):

    # =========================
    # 基本資料
    # =========================

    age = models.IntegerField(
        verbose_name="年齡"
    )

    gender = models.CharField(
        max_length=20,
        verbose_name="性別"
    )

    height = models.FloatField(
        verbose_name="身高"
    )

    weight = models.FloatField(
        verbose_name="體重"
    )

    bmi = models.FloatField(
        verbose_name="BMI"
    )


    # =========================
    # 睡眠
    # =========================

    sleep_hours = models.FloatField(
        verbose_name="每日平均睡眠時數"
    )

    sleep_category = models.CharField(
        max_length=50,
        verbose_name="睡眠分類"
    )


    # =========================
    # 生活型態
    # =========================

    smoking = models.CharField(
        max_length=30,
        verbose_name="抽菸狀況"
    )

    exercise = models.CharField(
        max_length=30,
        verbose_name="運動狀況"
    )

    alcohol = models.CharField(
        max_length=30,
        verbose_name="飲酒狀況"
    )

    betel_nut = models.CharField(
        max_length=30,
        verbose_name="檳榔狀況"
    )

    diet = models.CharField(
        max_length=30,
        verbose_name="飲食狀況"
    )


    # =========================
    # 腰圍
    # =========================

    waist = models.FloatField(
        null=True,
        blank=True,
        verbose_name="腰圍"
    )


    # =========================
    # 風險結果
    # =========================

    risk_level = models.CharField(
        max_length=30,
        verbose_name="風險層級"
    )

    risk_factors = models.TextField(
        blank=True,
        verbose_name="風險因素"
    )


    # =========================
    # 建立時間
    # =========================

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="建立時間"
    )


    def __str__(self):

        gender_display = {
            "male": "男性",
            "female": "女性",
        }.get(
            self.gender,
            self.gender
        )

        return (
            f"{self.created_at.strftime('%Y-%m-%d %H:%M')} "
            f"- {gender_display} "
            f"- {self.risk_level}"
        )


    class Meta:
        verbose_name = "代謝症候群篩檢紀錄"
        verbose_name_plural = "代謝症候群篩檢紀錄"
        ordering = [
            "-created_at"
        ]