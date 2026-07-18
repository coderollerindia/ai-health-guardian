"""Thin wrapper around google-generativeai: builds a model configured for
strict structured JSON output per-call, and parses the JSON response text."""
import json

import google.generativeai as genai
from google.generativeai.types import HarmBlockThreshold, HarmCategory

from app.config import settings
from app.gemini.schemas import (
    BILL_ANALYSIS_SCHEMA,
    CHAT_REPLY_SCHEMA,
    EMERGENCY_RECOMMENDATION_SCHEMA,
    PRESCRIPTION_ANALYSIS_SCHEMA,
    SUMMARY_SCHEMA,
)

genai.configure(api_key=settings.GEMINI_API_KEY)

# gemini-2.5-flash has been sunset for new API keys/projects (confirmed via
# genai.list_models() + a live generate_content 404) as of project setup —
# gemini-3.5-flash is the current stable flash-tier successor and has been
# verified to support the same multimodal input + response_schema JSON mode.
MODEL_NAME = "gemini-3.5-flash"

# Medical content (drug names, symptoms, injuries on bills/prescriptions) can
# otherwise trip Gemini's default "medical" safety category. We relax (but do
# not remove) safety filtering since this is a legitimate clinical-assistant
# use case, while still blocking genuinely dangerous content.
_SAFETY_SETTINGS = {
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
}


def _build_model(schema: dict) -> genai.GenerativeModel:
    return genai.GenerativeModel(
        MODEL_NAME,
        generation_config={
            "response_mime_type": "application/json",
            "response_schema": schema,
        },
        safety_settings=_SAFETY_SETTINGS,
    )


def _parse_json_response(response) -> dict:
    text = response.text
    return json.loads(text)


def analyze_prescription(prompt_text: str, file_bytes: bytes, mime_type: str) -> dict:
    model = _build_model(PRESCRIPTION_ANALYSIS_SCHEMA)
    image_part = {"mime_type": mime_type, "data": file_bytes}
    response = model.generate_content([prompt_text, image_part])
    return _parse_json_response(response)


def analyze_bill(prompt_text: str, file_bytes: bytes, mime_type: str) -> dict:
    model = _build_model(BILL_ANALYSIS_SCHEMA)
    image_part = {"mime_type": mime_type, "data": file_bytes}
    response = model.generate_content([prompt_text, image_part])
    return _parse_json_response(response)


def chat_reply(prompt_text: str) -> dict:
    model = _build_model(CHAT_REPLY_SCHEMA)
    response = model.generate_content([prompt_text])
    return _parse_json_response(response)


def generate_insights(prompt_text: str) -> dict:
    model = _build_model(SUMMARY_SCHEMA)
    response = model.generate_content([prompt_text])
    return _parse_json_response(response)


def assess_emergency(prompt_text: str) -> dict:
    model = _build_model(EMERGENCY_RECOMMENDATION_SCHEMA)
    response = model.generate_content([prompt_text])
    return _parse_json_response(response)
