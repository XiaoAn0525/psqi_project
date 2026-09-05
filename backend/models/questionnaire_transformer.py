from __future__ import annotations

from typing import Any


def calculate_bmi(height_cm: float, weight_kg: float) -> float:
    if not 100 <= height_cm <= 250:
        raise ValueError("height_cm must be between 100 and 250.")
    if not 25 <= weight_kg <= 350:
        raise ValueError("weight_kg must be between 25 and 350.")
    height_m = height_cm / 100.0
    return weight_kg / (height_m ** 2)


def sleep_category(hours: float) -> str:
    if not 0 < hours <= 24:
        raise ValueError("sleep_hours must be greater than 0 and at most 24.")
    if hours < 4:
        return "lt4h"
    if hours < 6:
        return "h4_6"
    if hours < 8:
        return "h6_8"
    return "gte8h"


def map_option(
    domain: str,
    key: str,
    questionnaire: dict[str, Any],
) -> dict[str, Any]:
    domain_spec = questionnaire["domains"].get(domain)
    if domain_spec is None:
        raise KeyError(f"Unknown questionnaire domain: {domain}")

    options = domain_spec.get("options", {})
    if key not in options:
        allowed = ", ".join(sorted(options))
        raise ValueError(
            f"Unknown option for {domain}: {key}. Allowed values: {allowed}"
        )
    return options[key]


def transform_request(
    payload: dict[str, Any],
    questionnaire: dict[str, Any],
) -> dict[str, Any]:
    bmi = calculate_bmi(payload["height_cm"], payload["weight_kg"])

    smoking = map_option(
        "smoking_status", payload["smoking_status"], questionnaire
    )
    drinking = map_option(
        "drinking_status", payload["drinking_status"], questionnaire
    )
    betel = map_option(
        "betel_status", payload["betel_status"], questionnaire
    )
    exercise = map_option(
        "exercise_frequency", payload["exercise_frequency"], questionnaire
    )
    vegetable = map_option(
        "vegetable_intake", payload["vegetable_intake"], questionnaire
    )
    fruit = map_option(
        "fruit_intake", payload["fruit_intake"], questionnaire
    )
    fried = map_option(
        "fried_processed_food", payload["fried_processed_food"], questionnaire
    )
    sauce = map_option(
        "salty_sauce_habit", payload["salty_sauce_habit"], questionnaire
    )

    transformed = {
        "age_years": float(payload["age"]),
        "sex": payload["sex"],
        "bmi_kg_m2": float(bmi),
        "smoking": smoking["harmonized_value"],
        "exercise_score_01": float(exercise["score_01"]),
        "drinking": drinking["harmonized_value"],
        "betel": betel["harmonized_value"],
        "diet_veg_score_01": float(vegetable["score_01"]),
        "diet_fruit_score_01": float(fruit["score_01"]),
        "diet_fried_score_01": float(fried["score_01"]),
        "diet_sauce_score_01": float(sauce["score_01"]),
        "sleep4": sleep_category(float(payload["sleep_hours"])),
    }
    if payload.get("waist_cm") is not None:
        transformed["waist_cm"] = float(payload["waist_cm"])
    return transformed


def frontend_questionnaire_schema(
    questionnaire: dict[str, Any],
) -> dict[str, Any]:
    """Return labels and keys to the frontend without exposing model scores."""
    result: dict[str, Any] = {
        "mapping_version": questionnaire["mapping_version"],
        "codebook_verified": questionnaire.get("codebook_verified", False),
        "approved": questionnaire.get("approved", False),
        "domains": {},
    }
    for domain, spec in questionnaire["domains"].items():
        result["domains"][domain] = {
            "question_zh": spec["question_zh"],
            "source_variable": spec["source_variable"],
            "source_years": spec["source_years"],
            "options": [
                {
                    "key": key,
                    "label_zh": option["label_zh"],
                }
                for key, option in spec["options"].items()
            ],
        }
    return result
