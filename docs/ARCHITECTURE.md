# AI Health Guardian — Architecture Contract

This is the single source of truth for DB schema, API contracts, and Gemini
response shapes. Every backend router and every frontend service call must
match this document exactly.

## Stack decisions

- Auth + DB: **Supabase only** (Postgres + Supabase Auth with Google OAuth).
  Firebase is not used. Frontend uses `@supabase/supabase-js` for login and
  gets a JWT (`session.access_token`); every backend request sends
  `Authorization: Bearer <token>`. FastAPI verifies the JWT using the
  Supabase JWT secret (HS256) — no round trip to Supabase needed per request.
- AI: Gemini 3.5 Flash via `google-generativeai` (current stable successor to `gemini-2.5-flash`, which is sunset for new API keys/projects), called **only from the
  backend** (key never reaches the browser). All analysis prompts request
  strict JSON via `response_mime_type: application/json` + a JSON schema.
- File storage: Supabase Storage bucket `uploads` (private, per-user folder
  `uploads/{user_id}/...`), signed URLs for display.

## Postgres schema (supabase/migrations/0001_init.sql)

```
profiles(id uuid PK -> auth.users.id, full_name, avatar_url, language text default 'en', theme text default 'system', created_at)

prescriptions(
  id uuid PK default gen_random_uuid(),
  user_id uuid -> auth.users.id,
  file_path text,               -- storage path
  notes text,
  ai_result jsonb,              -- full PrescriptionAnalysis (see below)
  confidence_score numeric,
  created_at timestamptz default now()
)

medicines(
  id uuid PK, prescription_id uuid -> prescriptions.id,
  name text, purpose text, dosage text,
  morning bool, afternoon bool, night bool,
  before_food bool, after_food bool,
  duration text, side_effects text[], important_notes text,
  unclear bool default false
)

bills(
  id uuid PK, user_id uuid -> auth.users.id,
  hospital_name text, location text, insurance_company text, notes text,
  file_path text,
  ai_result jsonb,              -- full BillAnalysis (see below)
  accuracy_score numeric,
  created_at timestamptz default now()
)

chat_messages(
  id uuid PK, user_id uuid -> auth.users.id, session_id uuid,
  role text check (role in ('user','assistant')), content text,
  context_type text, context_id uuid,  -- optional link to a prescription/bill
  created_at timestamptz default now()
)

reminders(
  id uuid PK, user_id uuid -> auth.users.id,
  medicine_name text, time_of_day text check (time_of_day in ('morning','afternoon','night')),
  reminder_time time, active bool default true,
  start_date date, end_date date, created_at timestamptz default now()
)

health_scores(
  id uuid PK, user_id uuid -> auth.users.id, score_date date default current_date,
  adherence numeric, nutrition numeric, hydration numeric,
  activity numeric, sleep numeric, risk numeric, overall numeric,
  created_at timestamptz default now()
)

emergency_checks(
  id uuid PK, user_id uuid -> auth.users.id, symptoms text,
  urgency text check (urgency in ('green','yellow','red')),
  recommendation jsonb, created_at timestamptz default now()
)
```

All tables: RLS enabled, policy `user_id = auth.uid()` (or via `prescriptions.user_id` join for `medicines`).

## REST API (FastAPI, prefix `/api`)

Auth: every route (except `/api/health`) requires `Authorization: Bearer <supabase_jwt>`, decoded to `user_id`.

| Method | Path | Body | Response |
|---|---|---|---|
| POST | /api/upload-prescription | multipart: `file`, `notes?` | `PrescriptionAnalysisResponse` |
| POST | /api/upload-bill | multipart: `file`, `hospital_name?`, `location?`, `insurance_company?`, `notes?` | `BillAnalysisResponse` |
| POST | /api/chat | json `{message, session_id?, context_type?, context_id?}` | `{reply, session_id, suggested_followups[]}` |
| GET | /api/history?type=&q=&from=&to= | - | `{items:[{id,type,title,subtitle,date,summary}]}` |
| GET | /api/summary?period=weekly\|monthly | - | `AIInsightsResponse` |
| GET | /api/medicine-reminder | - | `{reminders:[...]}` |
| POST | /api/medicine-reminder | json Reminder | created Reminder |
| PATCH | /api/medicine-reminder/{id} | partial Reminder | updated Reminder |
| DELETE | /api/medicine-reminder/{id} | - | `{ok:true}` |
| GET | /api/dashboard | - | `DashboardResponse` |
| POST | /api/emergency-check | json `{symptoms}` | `{urgency, recommendation:{action, reasons[], nearby_action}}` |
| GET | /api/health-score | - | `{current:{...}, history:[{date, overall, ...}]}` |

## Gemini response schemas

### PrescriptionAnalysis
```json
{
  "patient_summary": "string",
  "disease_symptoms": "string",
  "doctor_advice_summary": "string",
  "medicines": [{
    "name": "string", "purpose": "string", "dosage": "string",
    "morning": true, "afternoon": false, "night": true,
    "before_food": false, "after_food": true,
    "duration": "string", "side_effects": ["string"],
    "warnings": ["string"], "drug_interactions": ["string"],
    "missed_dose_instructions": "string", "storage_instructions": "string",
    "pregnancy_safety": "string", "children_safety": "string",
    "alcohol_warning": "string", "driving_warning": "string",
    "unclear": false, "important_notes": "string"
  }],
  "estimated_treatment_duration": "string",
  "emergency_warning_signs": ["string"],
  "lifestyle_suggestions": ["string"], "food_recommendations": ["string"],
  "foods_to_avoid": ["string"], "water_intake": "string",
  "exercise_suggestions": ["string"], "next_doctor_visit": "string",
  "questions_to_ask_doctor": ["string"], "confidence_score": 0.0
}
```

### BillAnalysis
```json
{
  "hospital_name": "string", "doctor_name": "string", "bill_date": "string",
  "bill_number": "string", "patient_name": "string",
  "line_items": [{"description":"string","category":"string","amount":0.0,"flagged":false,"flag_reason":"string"}],
  "subtotals": {"medicine_charges":0.0,"room_charges":0.0,"consultation_fees":0.0,"lab_charges":0.0,"gst":0.0,"discount":0.0,"grand_total":0.0},
  "verification": {
    "gst_correct": true, "duplicate_charges": ["string"],
    "unusually_expensive_medicines": ["string"], "suspicious_items": ["string"],
    "unnecessary_tests": ["string"], "hidden_charges": ["string"]
  },
  "cost_comparison": {"location":"string","hospital":"string","rating":"low|average|high","estimated_fair_price":0.0,"price_difference_pct":0.0,"savings_opportunity":0.0},
  "billing_confidence_score": 0.0, "overall_accuracy_score": 0.0,
  "recommendations": ["string"]
}
```

## Folder structure

```
ai-health-guardian/
  frontend/          Vite React app (see frontend/README section)
  backend/            FastAPI app
  supabase/
    migrations/0001_init.sql
  docs/
    ARCHITECTURE.md   (this file)
```

### frontend/src
```
components/   shared UI (GlassCard, GradientButton, TypingIndicator, FileDropzone, CameraCapture, MedicineTable, ScoreGauge, LanguageSwitch, ThemeToggle)
pages/        LandingPage, DashboardPage, PrescriptionScannerPage, BillScannerPage, ChatPage, HistoryPage, RemindersPage, EmergencyPage, HealthScorePage, InsightsPage, SettingsPage, LoginPage
hooks/        useAuth, useTheme, useDashboard, useChat
services/     api.js (axios instance), supabaseClient.js, prescriptionService, billService, chatService, historyService, reminderService, healthService
layouts/      AppLayout (sidebar+topbar), AuthLayout, PublicLayout
context/      AuthContext, ThemeContext
routes/       AppRoutes.jsx, ProtectedRoute.jsx
utils/        formatters.js, validators.js
theme/        palette.js, typography.js, theme.js (light+dark)
i18n/         i18n.js, locales/en.json, locales/hi.json, locales/kn.json
```

### backend/app
```
main.py
routers/  prescriptions.py, bills.py, chat.py, history.py, summary.py, reminders.py, dashboard.py, emergency.py, health_score.py, auth.py
services/ gemini_service.py, storage_service.py, fraud_detection.py, health_score_service.py
models/   pydantic response/request models (schemas.py split by domain)
database/ supabase_client.py
gemini/   prompts.py, schemas.py (JSON schemas passed to Gemini)
utils/    security.py (JWT decode), rate_limit.py, file_validation.py, image_compression.py
```
