"""Pydantic request/response models. Field names mirror docs/ARCHITECTURE.md
exactly for the shapes that document defines (PrescriptionAnalysis,
BillAnalysis, chat, history, emergency-check, health-score). A few endpoints
(summary/AIInsightsResponse, dashboard/DashboardResponse) are not given an
exact field-by-field shape in the architecture doc - those are designed here
per the plain-English requirements and noted as such below.
"""
from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


# --------------------------------------------------------------------------
# Prescription analysis
# --------------------------------------------------------------------------
class MedicineItem(BaseModel):
    name: str = ""
    purpose: Optional[str] = None
    dosage: Optional[str] = None
    morning: bool = False
    afternoon: bool = False
    night: bool = False
    before_food: bool = False
    after_food: bool = False
    duration: Optional[str] = None
    side_effects: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    drug_interactions: list[str] = Field(default_factory=list)
    missed_dose_instructions: Optional[str] = None
    storage_instructions: Optional[str] = None
    pregnancy_safety: Optional[str] = None
    children_safety: Optional[str] = None
    alcohol_warning: Optional[str] = None
    driving_warning: Optional[str] = None
    unclear: bool = False
    important_notes: Optional[str] = None


class PrescriptionAnalysis(BaseModel):
    patient_summary: Optional[str] = None
    disease_symptoms: Optional[str] = None
    doctor_advice_summary: Optional[str] = None
    medicines: list[MedicineItem] = Field(default_factory=list)
    estimated_treatment_duration: Optional[str] = None
    emergency_warning_signs: list[str] = Field(default_factory=list)
    lifestyle_suggestions: list[str] = Field(default_factory=list)
    food_recommendations: list[str] = Field(default_factory=list)
    foods_to_avoid: list[str] = Field(default_factory=list)
    water_intake: Optional[str] = None
    exercise_suggestions: list[str] = Field(default_factory=list)
    next_doctor_visit: Optional[str] = None
    questions_to_ask_doctor: list[str] = Field(default_factory=list)
    confidence_score: float = 0.0


class PrescriptionAnalysisResponse(PrescriptionAnalysis):
    id: str
    file_url: str


# --------------------------------------------------------------------------
# Bill analysis
# --------------------------------------------------------------------------
class LineItem(BaseModel):
    description: str = ""
    category: Optional[str] = None
    amount: float = 0.0
    flagged: bool = False
    flag_reason: Optional[str] = None


class Subtotals(BaseModel):
    medicine_charges: float = 0.0
    room_charges: float = 0.0
    consultation_fees: float = 0.0
    lab_charges: float = 0.0
    gst: float = 0.0
    discount: float = 0.0
    grand_total: float = 0.0


class Verification(BaseModel):
    gst_correct: bool = True
    duplicate_charges: list[str] = Field(default_factory=list)
    unusually_expensive_medicines: list[str] = Field(default_factory=list)
    suspicious_items: list[str] = Field(default_factory=list)
    unnecessary_tests: list[str] = Field(default_factory=list)
    hidden_charges: list[str] = Field(default_factory=list)


class CostComparison(BaseModel):
    location: Optional[str] = None
    hospital: Optional[str] = None
    rating: Literal["low", "average", "high"] = "average"
    estimated_fair_price: float = 0.0
    price_difference_pct: float = 0.0
    savings_opportunity: float = 0.0


class BillAnalysis(BaseModel):
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    bill_date: Optional[str] = None
    bill_number: Optional[str] = None
    patient_name: Optional[str] = None
    line_items: list[LineItem] = Field(default_factory=list)
    subtotals: Subtotals = Field(default_factory=Subtotals)
    verification: Verification = Field(default_factory=Verification)
    cost_comparison: CostComparison = Field(default_factory=CostComparison)
    billing_confidence_score: float = 0.0
    overall_accuracy_score: float = 0.0
    recommendations: list[str] = Field(default_factory=list)


class BillAnalysisResponse(BillAnalysis):
    id: str
    file_url: str


# --------------------------------------------------------------------------
# Chat
# --------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context_type: Optional[Literal["prescription", "bill"]] = None
    context_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    suggested_followups: list[str] = Field(default_factory=list)


# --------------------------------------------------------------------------
# History
# --------------------------------------------------------------------------
class HistoryItem(BaseModel):
    id: str
    type: str
    title: str
    subtitle: Optional[str] = None
    date: Optional[str] = None
    summary: Optional[str] = None


class HistoryResponse(BaseModel):
    items: list[HistoryItem]


# --------------------------------------------------------------------------
# Summary / AI insights
# NOTE: ARCHITECTURE.md names the response type `AIInsightsResponse` but does
# not enumerate its fields. Designed here per the router's plain-English
# requirements (weekly/monthly insights: adherence/spending/health trends +
# suggestions), plus the real aggregated `stats` used to generate them.
# --------------------------------------------------------------------------
class AIInsightsResponse(BaseModel):
    period: Literal["weekly", "monthly"]
    summary_text: str
    adherence_trend: Optional[str] = None
    spending_trend: Optional[str] = None
    health_trend: Optional[str] = None
    suggestions: list[str] = Field(default_factory=list)
    stats: dict[str, Any] = Field(default_factory=dict)


# --------------------------------------------------------------------------
# Reminders
# --------------------------------------------------------------------------
class ReminderBase(BaseModel):
    medicine_name: str
    time_of_day: Literal["morning", "afternoon", "night"]
    reminder_time: str  # "HH:MM" or "HH:MM:SS"
    active: bool = True
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ReminderCreate(ReminderBase):
    pass


class ReminderUpdate(BaseModel):
    medicine_name: Optional[str] = None
    time_of_day: Optional[Literal["morning", "afternoon", "night"]] = None
    reminder_time: Optional[str] = None
    active: Optional[bool] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class Reminder(ReminderBase):
    id: str
    user_id: str
    created_at: Optional[str] = None


# --------------------------------------------------------------------------
# Dashboard
# NOTE: ARCHITECTURE.md names `DashboardResponse` but does not enumerate its
# fields; designed here per the router's plain-English requirement to
# aggregate recent uploads, active reminder count, latest health score, and
# recent chat activity into one payload for dashboard cards.
# --------------------------------------------------------------------------
class DashboardResponse(BaseModel):
    recent_uploads: list[dict[str, Any]] = Field(default_factory=list)
    active_reminders_count: int = 0
    latest_health_score: dict[str, Any] = Field(default_factory=dict)
    recent_chat_activity: list[dict[str, Any]] = Field(default_factory=list)


# --------------------------------------------------------------------------
# Emergency check
# --------------------------------------------------------------------------
class EmergencyCheckRequest(BaseModel):
    symptoms: str


class EmergencyRecommendation(BaseModel):
    action: Literal["call_doctor", "visit_clinic", "emergency_hospital"]
    reasons: list[str] = Field(default_factory=list)
    nearby_action: Optional[str] = None


class EmergencyCheckResponse(BaseModel):
    urgency: Literal["green", "yellow", "red"]
    recommendation: EmergencyRecommendation


# --------------------------------------------------------------------------
# Health score
# --------------------------------------------------------------------------
class HealthScoreCurrent(BaseModel):
    score_date: str
    adherence: float
    nutrition: float
    hydration: float
    activity: float
    sleep: float
    risk: float
    overall: float


class HealthScoreHistoryItem(BaseModel):
    date: str
    overall: float
    adherence: Optional[float] = None
    nutrition: Optional[float] = None
    hydration: Optional[float] = None
    activity: Optional[float] = None
    sleep: Optional[float] = None
    risk: Optional[float] = None


class HealthScoreResponse(BaseModel):
    current: HealthScoreCurrent
    history: list[HealthScoreHistoryItem] = Field(default_factory=list)
