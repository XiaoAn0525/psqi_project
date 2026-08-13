from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import (
    PSQIResponse,
    MetabolicScreening,
)


# =========================================================
# PSQI 睡眠品質問卷
# =========================================================

@api_view(["POST"])
def submit_psqi(request):
    data = request.data

    try:
        total_score = int(
            data.get(
                "total_score",
                0
            )
        )

        PSQIResponse.objects.create(
            name=data.get(
                "name",
                ""
            ),

            age=data.get(
                "age"
            ) or None,

            gender=data.get(
                "gender",
                ""
            ),

            q1_bedtime=data.get(
                "q1_bedtime",
                ""
            ),

            q2_sleep_latency_minutes=(
                data.get(
                    "q2_sleep_latency_minutes"
                ) or None
            ),

            q3_wakeup_time=data.get(
                "q3_wakeup_time",
                ""
            ),

            q4_sleep_hours=(
                data.get(
                    "q4_sleep_hours"
                ) or None
            ),

            sleep_quality=int(
                data.get(
                    "sleep_quality",
                    0
                )
            ),

            sleep_latency=int(
                data.get(
                    "sleep_latency",
                    0
                )
            ),

            sleep_duration=int(
                data.get(
                    "sleep_duration",
                    0
                )
            ),

            sleep_efficiency=int(
                data.get(
                    "sleep_efficiency",
                    0
                )
            ),

            sleep_disturbance=int(
                data.get(
                    "sleep_disturbance",
                    0
                )
            ),

            sleeping_medication=int(
                data.get(
                    "sleeping_medication",
                    0
                )
            ),

            daytime_dysfunction=int(
                data.get(
                    "daytime_dysfunction",
                    0
                )
            ),

            total_score=total_score,
        )

        result = (
            "睡眠品質良好"
            if total_score <= 5
            else "睡眠品質較差，建議注意睡眠狀況"
        )

        return Response({
            "message": "success",
            "total_score": total_score,
            "result": result,
        })

    except (TypeError, ValueError):

        return Response(
            {
                "error": "PSQI 資料格式不正確"
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:

        print(
            "submit_psqi error:",
            e
        )

        return Response(
            {
                "error": "PSQI 問卷送出失敗"
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =========================================================
# PSQI 問卷紀錄
# =========================================================

@api_view(["GET"])
def list_psqi(request):
    records = (
        PSQIResponse.objects
        .all()
        .order_by("-created_at")
    )

    data = []

    for r in records:
        data.append({
            "id": r.id,

            "name": r.name,

            "age": r.age,

            "gender": r.gender,

            "q1_bedtime": r.q1_bedtime,

            "q2_sleep_latency_minutes":
                r.q2_sleep_latency_minutes,

            "q3_wakeup_time":
                r.q3_wakeup_time,

            "q4_sleep_hours":
                r.q4_sleep_hours,

            "sleep_quality":
                r.sleep_quality,

            "sleep_latency":
                r.sleep_latency,

            "sleep_duration":
                r.sleep_duration,

            "sleep_efficiency":
                r.sleep_efficiency,

            "sleep_disturbance":
                r.sleep_disturbance,

            "sleeping_medication":
                r.sleeping_medication,

            "daytime_dysfunction":
                r.daytime_dysfunction,

            "total_score":
                r.total_score,

            "created_at":
                r.created_at.strftime(
                    "%Y-%m-%d %H:%M"
                ),
        })

    return Response(data)


# =========================================================
# 代謝症候群初步風險篩檢
# =========================================================

@api_view(["POST"])
def predict_metabolic(request):
    data = request.data

    try:

        # =================================================
        # 1. 基本資料
        # =================================================

        age = int(
            data.get("age")
        )

        gender = data.get(
            "gender"
        )

        height = float(
            data.get("height")
        )

        weight = float(
            data.get("weight")
        )


        # =================================================
        # 2. 睡眠資料
        # =================================================

        sleep_hours = float(
            data.get("sleep_hours")
        )


        # =================================================
        # 3. 生活型態
        # =================================================

        smoking = data.get(
            "smoking"
        )

        exercise = data.get(
            "exercise"
        )

        alcohol = data.get(
            "alcohol"
        )

        betel_nut = data.get(
            "betel_nut"
        )

        diet = data.get(
            "diet"
        )


        # =================================================
        # 4. 腰圍
        # =================================================

        waist = data.get(
            "waist"
        )

        if waist in [
            "",
            None
        ]:
            waist = None

        else:
            waist = float(
                waist
            )


        # =================================================
        # 5. 基本資料驗證
        # =================================================

        if age < 18 or age > 100:

            return Response(
                {
                    "error":
                        "年齡必須介於 18～100 歲"
                },
                status=
                    status.HTTP_400_BAD_REQUEST
            )


        if gender not in [
            "male",
            "female"
        ]:

            return Response(
                {
                    "error":
                        "性別資料不正確"
                },
                status=
                    status.HTTP_400_BAD_REQUEST
            )


        if height < 100 or height > 250:

            return Response(
                {
                    "error":
                        "身高資料不正確"
                },
                status=
                    status.HTTP_400_BAD_REQUEST
            )


        if weight < 25 or weight > 300:

            return Response(
                {
                    "error":
                        "體重資料不正確"
                },
                status=
                    status.HTTP_400_BAD_REQUEST
            )


        if sleep_hours < 1 or sleep_hours > 16:

            return Response(
                {
                    "error":
                        "睡眠時數資料不正確"
                },
                status=
                    status.HTTP_400_BAD_REQUEST
            )


        # =================================================
        # 6. 生活型態驗證
        # =================================================

        valid_smoking = [
            "never",
            "current",
            "former"
        ]

        valid_exercise = [
            "rare",
            "1_2",
            "3_plus"
        ]

        valid_alcohol = [
            "never",
            "current",
            "former"
        ]

        valid_betel_nut = [
            "never",
            "current",
            "former"
        ]

        valid_diet = [
            "rare",
            "sometimes",
            "often"
        ]


        if smoking not in valid_smoking:

            return Response(
                {
                    "error":
                        "抽菸資料不正確"
                },
                status=
                    status.HTTP_400_BAD_REQUEST
            )


        if exercise not in valid_exercise:

            return Response(
                {
                    "error":
                        "運動資料不正確"
                },
                status=
                    status.HTTP_400_BAD_REQUEST
            )


        if alcohol not in valid_alcohol:

            return Response(
                {
                    "error":
                        "飲酒資料不正確"
                },
                status=
                    status.HTTP_400_BAD_REQUEST
            )


        if betel_nut not in valid_betel_nut:

            return Response(
                {
                    "error":
                        "檳榔資料不正確"
                },
                status=
                    status.HTTP_400_BAD_REQUEST
            )


        if diet not in valid_diet:

            return Response(
                {
                    "error":
                        "飲食資料不正確"
                },
                status=
                    status.HTTP_400_BAD_REQUEST
            )


        # =================================================
        # 7. 腰圍驗證
        # =================================================

        if waist is not None:

            if waist < 40 or waist > 200:

                return Response(
                    {
                        "error":
                            "腰圍資料不正確"
                    },
                    status=
                        status.HTTP_400_BAD_REQUEST
                )


        # =================================================
        # 8. BMI 計算
        # =================================================

        height_m = (
            height / 100
        )

        bmi = (
            weight /
            (
                height_m ** 2
            )
        )

        bmi = round(
            bmi,
            1
        )


        # =================================================
        # 9. BMI 分類
        # =================================================

        if bmi < 18.5:

            bmi_category = (
                "體重過輕"
            )

        elif bmi < 24:

            bmi_category = (
                "正常範圍"
            )

        elif bmi < 27:

            bmi_category = (
                "體重過重"
            )

        else:

            bmi_category = (
                "肥胖範圍"
            )


        # =================================================
        # 10. 睡眠分類
        # =================================================

        if sleep_hours < 6:

            sleep_category = (
                "睡眠不足"
            )

        elif sleep_hours < 7:

            sleep_category = (
                "睡眠偏短"
            )

        elif sleep_hours <= 9:

            sleep_category = (
                "一般睡眠範圍"
            )

        else:

            sleep_category = (
                "睡眠偏長"
            )


        # =================================================
        # 11. 規則式風險計算
        # =================================================

        risk_score = 0

        risk_factors = []


        # BMI 過重
        if bmi >= 24:

            risk_score += 1

            risk_factors.append(
                "BMI 達體重過重範圍"
            )


        # BMI 肥胖再增加一項
        if bmi >= 27:

            risk_score += 1

            risk_factors.append(
                "BMI 達肥胖範圍"
            )


        # 睡眠不足
        if sleep_hours < 6:

            risk_score += 1

            risk_factors.append(
                "每日平均睡眠少於 6 小時"
            )


        # 抽菸
        if smoking == "current":

            risk_score += 1

            risk_factors.append(
                "目前有抽菸習慣"
            )


        # 運動不足
        if exercise == "rare":

            risk_score += 1

            risk_factors.append(
                "目前幾乎沒有規律運動"
            )


        # 飲酒
        if alcohol == "current":

            risk_score += 1

            risk_factors.append(
                "目前有飲酒習慣"
            )


        # 檳榔
        if betel_nut == "current":

            risk_score += 1

            risk_factors.append(
                "目前有嚼檳榔習慣"
            )


        # 飲食
        if diet == "often":

            risk_score += 1

            risk_factors.append(
                "經常攝取高油、高糖或高熱量食物"
            )


        # =================================================
        # 12. 腰圍判斷
        # =================================================

        waist_high = False


        if waist is not None:

            if (
                gender == "male"
                and waist >= 90
            ):

                waist_high = True


            elif (
                gender == "female"
                and waist >= 80
            ):

                waist_high = True


        if waist_high:

            risk_score += 1

            risk_factors.append(
                "腰圍達腹部肥胖警戒範圍"
            )


        # =================================================
        # 13. 風險分層
        #
        # 分數只用於後端判斷
        # 不顯示給使用者
        # =================================================

        if risk_score <= 2:

            risk_level = (
                "低風險"
            )

        elif risk_score <= 5:

            risk_level = (
                "中度風險"
            )

        else:

            risk_level = (
                "高風險"
            )


        # =================================================
        # 14. 健康建議
        # =================================================

        recommendations = []


        # BMI
        if bmi >= 24:

            recommendations.append(
                "BMI 偏高，建議留意體重變化，"
                "並維持適當的日常身體活動。"
            )


        # 睡眠
        if sleep_hours < 7:

            recommendations.append(
                "目前平均睡眠時間較短，"
                "建議維持規律作息並留意睡眠時間。"
            )


        # 運動
        if exercise == "rare":

            recommendations.append(
                "目前運動頻率較低，"
                "可依自身狀況逐步增加日常活動。"
            )


        # 抽菸
        if smoking == "current":

            recommendations.append(
                "目前有抽菸習慣，"
                "建議考慮減少吸菸並尋求戒菸相關資源。"
            )


        # 飲酒
        if alcohol == "current":

            recommendations.append(
                "目前有飲酒習慣，"
                "建議留意飲酒頻率與飲酒量。"
            )


        # 檳榔
        if betel_nut == "current":

            recommendations.append(
                "目前有嚼檳榔習慣，"
                "建議考慮減少或停止使用檳榔。"
            )


        # 飲食
        if diet == "often":

            recommendations.append(
                "目前較常攝取高油、高糖或高熱量食物，"
                "建議留意飲食內容並維持均衡飲食。"
            )


        # 腰圍
        if waist_high:

            recommendations.append(
                "目前腰圍達腹部肥胖警戒範圍，"
                "建議持續留意腰圍與體重變化。"
            )


        # 沒有特殊建議
        if len(recommendations) == 0:

            recommendations.append(
                "目前填寫資料未出現較明顯的風險提醒，"
                "建議持續維持良好的生活與健康習慣。"
            )


        # =================================================
        # 15. 儲存代謝症候群篩檢紀錄
        # =================================================

        screening_record = (
            MetabolicScreening.objects.create(

                # 基本資料
                age=age,

                gender=gender,

                height=height,

                weight=weight,

                bmi=bmi,


                # 睡眠
                sleep_hours=sleep_hours,

                sleep_category=
                    sleep_category,


                # 生活型態
                smoking=smoking,

                exercise=exercise,

                alcohol=alcohol,

                betel_nut=
                    betel_nut,

                diet=diet,


                # 腰圍
                waist=waist,


                # 結果
                risk_level=
                    risk_level,

                risk_factors=
                    "\n".join(
                        risk_factors
                    ),
            )
        )


        # =================================================
        # 16. 回傳 React
        #
        # 不回傳風險分數
        # 不回傳百分比
        # =================================================

        return Response({

            "message":
                "success",

            "record_id":
                screening_record.id,


            # 風險結果
            "risk_level":
                risk_level,


            # 風險原因
            "risk_factors":
                risk_factors,


            # BMI
            "bmi":
                bmi,

            "bmi_category":
                bmi_category,


            # 睡眠
            "sleep_hours":
                sleep_hours,

            "sleep_category":
                sleep_category,


            # 腰圍
            "waist":
                waist,

            "waist_high":
                waist_high,


            # 健康建議
            "recommendations":
                recommendations,


            # 免責聲明
            "disclaimer":
                (
                    "本工具僅提供初步健康風險篩檢，"
                    "不是醫療診斷，也不預測未來是否一定會罹病。"
                    "正式的代謝症候群判定仍需搭配完整健檢資料。"
                    "如已有完整健檢結果，"
                    "應以健檢報告或醫師說明為準。"
                ),
        })


    # =====================================================
    # 資料格式錯誤
    # =====================================================

    except (
        TypeError,
        ValueError
    ):

        return Response(
            {
                "error":
                    "資料格式不正確，請重新確認填寫內容。"
            },
            status=
                status.HTTP_400_BAD_REQUEST
        )


    # =====================================================
    # 其他錯誤
    # =====================================================

    except Exception as e:

        print(
            "predict_metabolic error:",
            e
        )

        return Response(
            {
                "error":
                    "伺服器處理資料時發生錯誤"
            },
            status=
                status.HTTP_500_INTERNAL_SERVER_ERROR
        )