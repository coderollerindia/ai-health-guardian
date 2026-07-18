"""JSON Schema dicts passed as `response_schema` to Gemini's structured output mode.

Field names here mirror docs/ARCHITECTURE.md exactly (PrescriptionAnalysis /
BillAnalysis / chat / summary / emergency shapes). Type strings use the
uppercase protobuf enum names (STRING/OBJECT/ARRAY/BOOLEAN/NUMBER) that the
google-generativeai SDK's Schema type expects.
"""

_STRING = {"type": "STRING"}
_STRING_ARRAY = {"type": "ARRAY", "items": {"type": "STRING"}}
_BOOL = {"type": "BOOLEAN"}
_NUMBER = {"type": "NUMBER"}

MEDICINE_ITEM_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "name": _STRING,
        "purpose": _STRING,
        "dosage": _STRING,
        "morning": _BOOL,
        "afternoon": _BOOL,
        "night": _BOOL,
        "before_food": _BOOL,
        "after_food": _BOOL,
        "duration": _STRING,
        "side_effects": _STRING_ARRAY,
        "warnings": _STRING_ARRAY,
        "drug_interactions": _STRING_ARRAY,
        "missed_dose_instructions": _STRING,
        "storage_instructions": _STRING,
        "pregnancy_safety": _STRING,
        "children_safety": _STRING,
        "alcohol_warning": _STRING,
        "driving_warning": _STRING,
        "unclear": _BOOL,
        "important_notes": _STRING,
    },
    "required": ["name", "dosage", "morning", "afternoon", "night", "before_food", "after_food", "unclear"],
}

PRESCRIPTION_ANALYSIS_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "patient_summary": _STRING,
        "disease_symptoms": _STRING,
        "doctor_advice_summary": _STRING,
        "medicines": {"type": "ARRAY", "items": MEDICINE_ITEM_SCHEMA},
        "estimated_treatment_duration": _STRING,
        "emergency_warning_signs": _STRING_ARRAY,
        "lifestyle_suggestions": _STRING_ARRAY,
        "food_recommendations": _STRING_ARRAY,
        "foods_to_avoid": _STRING_ARRAY,
        "water_intake": _STRING,
        "exercise_suggestions": _STRING_ARRAY,
        "next_doctor_visit": _STRING,
        "questions_to_ask_doctor": _STRING_ARRAY,
        "confidence_score": _NUMBER,
    },
    "required": ["patient_summary", "medicines", "confidence_score"],
}

LINE_ITEM_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "description": _STRING,
        "category": _STRING,
        "amount": _NUMBER,
        "flagged": _BOOL,
        "flag_reason": _STRING,
    },
    "required": ["description", "amount", "flagged"],
}

SUBTOTALS_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "medicine_charges": _NUMBER,
        "room_charges": _NUMBER,
        "consultation_fees": _NUMBER,
        "lab_charges": _NUMBER,
        "gst": _NUMBER,
        "discount": _NUMBER,
        "grand_total": _NUMBER,
    },
    "required": ["grand_total"],
}

VERIFICATION_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "gst_correct": _BOOL,
        "duplicate_charges": _STRING_ARRAY,
        "unusually_expensive_medicines": _STRING_ARRAY,
        "suspicious_items": _STRING_ARRAY,
        "unnecessary_tests": _STRING_ARRAY,
        "hidden_charges": _STRING_ARRAY,
    },
    "required": ["gst_correct"],
}

COST_COMPARISON_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "location": _STRING,
        "hospital": _STRING,
        "rating": {"type": "STRING", "enum": ["low", "average", "high"]},
        "estimated_fair_price": _NUMBER,
        "price_difference_pct": _NUMBER,
        "savings_opportunity": _NUMBER,
    },
    "required": ["rating", "estimated_fair_price"],
}

BILL_ANALYSIS_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "hospital_name": _STRING,
        "doctor_name": _STRING,
        "bill_date": _STRING,
        "bill_number": _STRING,
        "patient_name": _STRING,
        "line_items": {"type": "ARRAY", "items": LINE_ITEM_SCHEMA},
        "subtotals": SUBTOTALS_SCHEMA,
        "verification": VERIFICATION_SCHEMA,
        "cost_comparison": COST_COMPARISON_SCHEMA,
        "billing_confidence_score": _NUMBER,
        "overall_accuracy_score": _NUMBER,
        "recommendations": _STRING_ARRAY,
    },
    "required": ["line_items", "subtotals", "verification", "cost_comparison", "overall_accuracy_score"],
}

CHAT_REPLY_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "reply": _STRING,
        "suggested_followups": _STRING_ARRAY,
    },
    "required": ["reply", "suggested_followups"],
}

SUMMARY_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "summary_text": _STRING,
        "adherence_trend": _STRING,
        "spending_trend": _STRING,
        "health_trend": _STRING,
        "suggestions": _STRING_ARRAY,
    },
    "required": ["summary_text", "suggestions"],
}

EMERGENCY_RECOMMENDATION_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "urgency": {"type": "STRING", "enum": ["green", "yellow", "red"]},
        "reasoning": _STRING,
        "recommendation": {
            "type": "OBJECT",
            "properties": {
                "action": {
                    "type": "STRING",
                    "enum": ["call_doctor", "visit_clinic", "emergency_hospital"],
                },
                "reasons": _STRING_ARRAY,
                "nearby_action": _STRING,
            },
            "required": ["action", "reasons", "nearby_action"],
        },
    },
    "required": ["urgency", "recommendation"],
}
