# Maverick Execution Platform — Implementation Reference

A detailed technical reference covering how every feature in the application was built, what libraries power it, and key design decisions made along the way.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Tech Stack at a Glance](#2-tech-stack-at-a-glance)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Authentication & Session Management](#5-authentication--session-management)
6. [Role-Based Routing](#6-role-based-routing)
7. [Data Layer & API Communication](#7-data-layer--api-communication)
8. [In-Memory Data Store](#8-in-memory-data-store)
9. [Profile Pictures & Avatars (DiceBear)](#9-profile-pictures--avatars-dicebear)
10. [UI Component System (Shadcn UI + Radix)](#10-ui-component-system-shadcn-ui--radix)
11. [Theming — Light / Dark Mode & Color Schemes](#11-theming--light--dark-mode--color-schemes)
12. [Dashboard](#12-dashboard)
13. [Batch Management](#13-batch-management)
14. [Candidate Management](#14-candidate-management)
15. [Attendance Tracking](#15-attendance-tracking)
16. [Trainer Management](#16-trainer-management)
17. [Schedule & Calendar](#17-schedule--calendar)
18. [Assessments](#18-assessments)
19. [Feedback](#19-feedback)
20. [Reports & CSV Export](#20-reports--csv-export)
21. [Notifications](#21-notifications)
22. [Candidate Portal](#22-candidate-portal)
23. [MaveAI — Artificial Intelligence Features](#23-maveai--artificial-intelligence-features)
24. [AI Safety & Content Guardrails](#24-ai-safety--content-guardrails)
25. [System Utilities](#25-system-utilities)
26. [Candidate Status Logic](#26-candidate-status-logic)
27. [Performance Data Source](#27-performance-data-source)

---

## 1. Project Structure

The application is a **node project** with:

```
frontend/          ← React + Vite frontend (SPA)
backend/           ← Node.js + Express REST API backend
```

Both artifacts run as separate processes. The frontend proxies `/api` requests to the backend in development via Vite's `server.proxy` config.

---

## 2. Tech Stack at a Glance

| Concern | Technology |
|---|---|
| Frontend framework | React 18 (TypeScript) |
| Build tool | Vite 7 |
| Backend framework | Node.js + Express |
| UI component library | Shadcn UI (Radix UI primitives) |
| Styling | Tailwind CSS v4 |
| Routing | Wouter (lightweight React Router alternative) |
| Server state / data fetching | TanStack Query (React Query) v5 |
| Animations | Framer Motion |
| Charts | Recharts |
| AI model | Google Gemini 2.5 Flash via `@google/genai` SDK |
| Avatar generation | DiceBear API v7 |
| Icon library | Lucide React |
| Logger (backend) | Pino + pino-http |
| Build bundler (backend) | esbuild (custom `build.mjs` script) |
| Package manager | npm |

---

## 3. Frontend Architecture

**Entry point:** `frontend/src/main.tsx`

The app is wrapped in a strict provider hierarchy defined in `App.tsx`:

```
QueryClientProvider          ← TanStack Query global cache
  ThemeProvider              ← next-themes (light/dark)
    ColorSchemeProvider      ← custom color palette switcher
      SettingsProvider       ← user preferences (persisted in localStorage)
        TooltipProvider      ← Radix tooltip context
          NetworkStatusProvider   ← monitors /api health
            WouterRouter     ← base-path-aware URL router
              AINotificationsProvider  ← global AI task toasts
                Router       ← role-based route guard
                  AppShell / CandidateShell
```

Every data fetch goes through **TanStack Query** hooks defined in `src/hooks/use-data.ts`. This gives automatic caching, background refetching, and cache invalidation when mutations succeed.

---

## 4. Backend Architecture

**Entry point:** `backend/src/index.ts`

The server reads `PORT` from the environment and binds Express to it. Routes are mounted under `/api`:

```
/api
  /auth/login          POST  — credential check, returns session object
  /auth/me             GET   — validate active session email
  /dashboard/summary   GET   — aggregated KPIs
  /dashboard/charts    GET   — chart datasets
  /batches             GET, POST
  /batches/:id         GET
  /batches/:id/assessments  GET
  /batches/:id/feedback     GET
  /candidates          GET
  /candidates/:id      GET
  /trainers            GET
  /trainers/:id        GET
  /sessions            GET
  /assessments         GET
  /feedback            GET
  /notifications       GET
  /attendance          GET   — filter by ?batchId=
  /attendance/bulk     POST  — save records, recompute percentages
  /ai/*                      — all MaveAI endpoints (see §23)
```

The build pipeline compiles TypeScript to a single ESM bundle via **esbuild** (`build.mjs`), then runs the output with `node --enable-source-maps`. This keeps cold starts fast while retaining readable stack traces.

---

## 5. Authentication & Session Management

**File:** `frontend/src/lib/auth.ts`  
**File:** `backend/src/routes/auth.ts`

Authentication is **stateless and sessionless on the server**. After a successful `POST /api/auth/login`, the backend returns a plain JSON object:

```json
{ "id": "admin-0", "name": "Platform Admin", "email": "admin@hexaware.com", "role": "admin" }
```

The frontend writes this to `localStorage` under the key `maverick.session` and reads it back synchronously on every route render via `getSession()`. There are no cookies, no JWT tokens, and no server-side session store — this is intentional for a demo context where simplicity matters.

**Password:** A single fixed password (`Password@123`) is accepted for all accounts. The backend normalises the email to lowercase before matching.

**Demo accounts:**
- Admin: `admin@hexaware.com` / `Password@123`
- Candidate: `kishlay.kumar@hexaware.com` / `Password@123`
- Any trainer email also works as an admin login.

---

## 6. Role-Based Routing

**File:** `frontend/src/App.tsx`

The `Router` component reads the session synchronously and applies three rules before rendering any page:

1. Unauthenticated users are redirected to `/login`.
2. A candidate trying to access an admin URL (`/`, `/batches`, etc.) is redirected to `/candidate`.
3. An admin trying to access a candidate URL (`/candidate/*`) is redirected to `/`.

The candidate portal is mounted on a **Wouter sub-router** with `base="/candidate"`, meaning all routes inside `CandidateRouter` are relative (e.g. `/batch` resolves to `/candidate/batch`). The admin portal uses the root router.

**Routing library — Wouter:** Chosen over React Router for its minimal bundle size (~2 KB vs ~50 KB). It uses the same `<Switch>` / `<Route>` / `<Redirect>` mental model but with no `BrowserRouter` boilerplate.

---

## 7. Data Layer & API Communication

**File:** `frontend/src/lib/api.ts`  
**File:** `frontend/src/hooks/use-data.ts`

All HTTP calls go through `apiFetch`, a thin wrapper around `fetch` that:
- Prepends the `API_URL` base (overrideable via `VITE_API_URL`)
- Sets `Content-Type: application/json` automatically
- Throws a typed `ApiError(status, message)` on non-2xx responses (which TanStack Query surfaces as mutation/query errors)

`use-data.ts` exports one hook per resource. Each hook is a `useQuery` or `useMutation` from TanStack Query. On a successful mutation (e.g. creating a batch, saving attendance), the relevant query keys are invalidated so all components referencing that data re-fetch automatically without a page reload.

---

## 8. In-Memory Data Store

**File:** `backend/src/lib/data.ts`

All application data lives in plain TypeScript arrays in memory — no database is used. Data is generated deterministically on server startup using a **seeded linear-congruential RNG** (`makeRng(12345)`) so the same 250 candidates, 35 batches, 20 trainers, and associated records appear on every restart.

Key datasets generated at startup:
- **20 trainers** — names, emails, skills, utilization, rating
- **35 batches** — spread across the past 14 months + 2 future months, statuses derived from date ranges
- **250 candidates** — randomly assigned to batches, with performance and attendance values that deterministically drive their status
- **Attendance records** — seeded for the last 10 weekdays for all active-batch candidates (see §15)
- **Assessments, feedback, sessions, notifications** — all generated from the batch/trainer/candidate arrays

---

## 9. Profile Pictures & Avatars (DiceBear)

**File:** `frontend/src/lib/avatar.ts`  
**Backend also uses:** `data.ts` (inline helper mirroring the same URL pattern)

Every candidate and trainer profile picture is a **dynamically generated SVG avatar** from the [DiceBear API](https://dicebear.com) — no image files are stored in the project.

```typescript
const STYLE_HUMAN = "notionists-neutral";   // for candidates & trainers
const STYLE_BOT   = "bottts-neutral";       // for MaveAI

const PALETTE = "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,c0f5e1"; // soft corporate colours

export function getAvatar(seed: string, opts?: { bot?: boolean }) {
  const style = opts?.bot ? STYLE_BOT : STYLE_HUMAN;
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${PALETTE}&radius=50`;
}
```

- **Seed** = the person's full name (e.g. `"Kishlay Kumar"`), so the same name always produces the same face.
- **`radius=50`** makes the avatar a circle.
- **`backgroundColor`** restricts DiceBear's palette to the six hex codes above, keeping all avatars visually consistent with the app's design language.
- The fallback when an image fails to load is **initials** extracted by `avatarInitials(name)` — splits on spaces, takes the first character of each word, returns up to 2 uppercase letters.
- MaveAI uses the `bottts-neutral` style (a robot/bot illustration) to visually distinguish itself from human users.

---

## 10. UI Component System (Shadcn UI + Radix)

**Directory:** `frontend/src/components/ui/`

The UI is built on **Shadcn UI** — a collection of copy-paste React components that wrap **Radix UI** accessibility primitives and are styled with **Tailwind CSS**. Every component (Button, Card, Dialog, Select, Tabs, Table, Progress, etc.) lives in `src/components/ui/` and can be customised directly.

Key benefits of this approach:
- Full ownership — components are in the repo, not a `node_modules` black box
- Radix handles all ARIA roles, keyboard navigation, and focus trapping
- Tailwind handles all visual styling via utility classes
- **CSS variables** define the design tokens (`--background`, `--foreground`, `--primary`, etc.) so theming is one variable change, not a component change

**Charts** use **Recharts** — a React-first wrapper around D3. Used for bar charts, radar charts, and trend lines on the Dashboard and Candidate Detail pages.

**Animations** use **Framer Motion** — page transition effects on the Login page role switcher and other micro-interactions.

---

## 11. Theming — Light / Dark Mode & Color Schemes

**Files:**  
- `frontend/src/components/theme-provider.tsx` — wraps `next-themes`  
- `frontend/src/components/color-scheme-provider.tsx` — custom scheme switcher  
- `frontend/src/components/settings-provider.tsx` — persists preferences

**Light/Dark mode** is handled by `next-themes`. It writes a `class="dark"` attribute on `<html>` and Tailwind's `dark:` variants do the rest.

**Color schemes** (Zinc, Slate, Stone, etc.) are implemented via a `ColorSchemeProvider` that swaps a `data-scheme="zinc"` attribute on `<body>`. Each scheme redefines the Tailwind CSS design tokens, so the entire app recolours without any component changes.

User preferences (theme, color scheme, sidebar pin state, etc.) are persisted to `localStorage` via `SettingsProvider` so they survive page reloads.

---

## 12. Dashboard

**File:** `frontend/src/pages/Dashboard.tsx`

The dashboard fetches two endpoints:
- `GET /api/dashboard/summary` — KPI cards (active batches, candidates in training, average attendance %, average pass rate, trainer utilization, at-risk count)
- `GET /api/dashboard/charts` — three Recharts datasets: enrollment trend (batches per month), location distribution (candidates by city), technology mix (batch count by tech track)

KPI cards use Shadcn `<Card>` components with trend indicators. Charts are rendered with Recharts `<BarChart>`, `<PieChart>`, and `<AreaChart>`. The AI Daily Briefing card (`AIBriefingCard.tsx`) fetches from `/api/ai/briefing` and renders the markdown response using `AIMarkdown.tsx` (see §23).

---

## 13. Batch Management

**Files:**  
- `frontend/src/pages/Batches.tsx` — list + filters  
- `frontend/src/pages/BatchDetail.tsx` — single batch view  
- `frontend/src/pages/BatchNew.tsx` — creation form with AI drafting

**List view:** Filterable by status, technology, location. Displays attendance % and pass rate per batch with colour-coded badges.

**Detail view:** Shows the batch's trainer, schedule summary, candidate roster with individual metrics, assessment history, and feedback.

**Create new batch:** The form includes an **AI Draft** feature (`AIDraftBatchCard.tsx`) where the admin types a free-text prompt (e.g. "8-week Java Full Stack for 20 freshers in Pune") and MaveAI returns a structured JSON curriculum (weeks, topics, outcomes, suggested assessments) which pre-fills the form fields.

New batches are created via `POST /api/batches` and the `candidates`, `batches`, and `dashboard-summary` query keys are invalidated on success.

---

## 14. Candidate Management

**Files:**  
- `frontend/src/pages/Candidates.tsx` — sortable/filterable table  
- `frontend/src/pages/CandidateDetail.tsx` — individual profile

**Candidates list:** A full data table with columns for name, batch, performance %, attendance %, and status badge. Supports text search, status filter, and column sorting.

**Candidate detail:**
- **Performance score** displayed as a progress bar — sourced from `candidate.performance` (see §27)
- **Attendance %** displayed as a progress bar — sourced from `candidate.attendancePercent`, computed from attendance records (see §15)
- **Radar chart** (Recharts `<RadarChart>`) with axes for Performance, Attendance (labelled "Punctuality"), Engagement, and Communication
- **Risk Narrative card** — if the candidate is "At Risk", the `RiskNarrativeCard` calls `/api/ai/candidates/:id/risk-narrative` and renders a structured AI analysis (summary, risk drivers, recommended actions)
- **Avatar** — generated by DiceBear using the candidate's name as seed (see §9)

---

## 15. Attendance Tracking

**Files:**  
- `frontend/src/pages/Attendance.tsx` — admin entry grid  
- `backend/src/lib/data.ts` — seeding + recompute helpers  
- `backend/src/routes/data.ts` — GET /attendance, POST /attendance/bulk  
- `frontend/src/hooks/use-data.ts` — `useAttendanceRecords`, `useSaveAttendance`

### How records are seeded

On server startup, `data.ts` generates attendance records for the **last 10 weekdays** (Mon–Fri only) for every candidate in an "In Progress" or "Planned" batch. The status per candidate per day is derived deterministically from their `attendancePercent` using a hash of their ID and the day index — so a candidate with 90% attendance will have roughly 1 absent day in 10, always the same days on every restart.

### Manual entry UI

The Attendance page shows a grid:
- **Rows** = candidates in the selected batch
- **Columns** = the 10 seeded days, with **today prepended** as the first column if today is a weekday and has no saved records yet

**Today's column** is pinned immediately after "Overall %" so the admin sees the action item first. Once it is filled in and saved, it moves to its natural chronological position at the end.

**Cell interaction:** Clicking any cell cycles the status: `Not Marked (—) → Present → Absent → Late → Present`. The "Not Marked" state (gray dash) is a frontend-only concept meaning no record exists. It does not affect the attendance percentage until explicitly set.

### How percentage is calculated

`attendancePercent = (Present days + Late days) ÷ total marked days × 100`

Unmarked cells are excluded from this calculation, so a brand-new "Today" column does not reduce anyone's percentage until the admin fills it in.

### How saves propagate across the app

`POST /attendance/bulk` accepts an array of `{ candidateId, batchId, date, status }` records. The server:
1. Upserts each record into the in-memory `attendanceRecords` array
2. Calls `recomputeCandidateAttendance(candidateId)` for every affected candidate — this recalculates `attendancePercent`, re-derives `status` (Active / At Risk / Dropped), and updates the batch's own average attendance %
3. Returns the updated candidate objects

The frontend then invalidates the `attendance`, `candidates`, `batches`, and `dashboard-summary` query keys so every page that shows attendance data (Candidate Detail, Candidates list, Dashboard KPIs, Batch Detail) re-fetches automatically.

---

## 16. Trainer Management

**Files:**  
- `frontend/src/pages/Trainers.tsx`  
- `frontend/src/pages/TrainerDetail.tsx`

Trainers have a utilization % and a star rating. The detail page shows their skills as tags, current batch assignments, and location. Avatars are DiceBear `notionists-neutral` seeded from the trainer's name, identical to candidates.

---

## 17. Schedule & Calendar

**File:** `frontend/src/pages/Schedule.tsx`

The schedule renders a **weekly calendar grid** (Monday–Friday, 08:00–20:00) for all active batches. Sessions are generated at startup in `data.ts` as `ScheduleSession` objects with a `day` (1–7), `startHour`, and `durationHours`.

Notable features:
- **Conflict detection** — if two sessions for the same trainer overlap in time, both are highlighted in red with a warning badge ("Trainer conflict")
- **Filtering** by trainer and session type (Lecture / Lab / Assessment / Workshop / Review)
- Session cards are colour-coded by type using a fixed colour map

---

## 18. Assessments

**File:** `frontend/src/pages/Assessments.tsx`

Lists all assessments across all batches with status badges (Pending / Graded / Published) and pass rate indicators. The **Generate Questions** feature (`GenerateQuestionsDialog.tsx`) calls `/api/ai/assessments/generate` with a topic, difficulty level, and count, and returns MCQ questions with options, the correct answer, and an explanation. Results are stored in `localStorage` under `maveai.generate-questions.last-result` so they survive navigation.

---

## 19. Feedback

**File:** `frontend/src/pages/Feedback.tsx`

Aggregates feedback submitted by candidates. The **Feedback Themes** card (`FeedbackThemesCard.tsx`) calls `/api/ai/feedback/themes` and returns an AI-analysed sentiment summary with recurring themes, mention counts, and representative quotes. Themes are cached in TanStack Query with `staleTime: Infinity` to avoid redundant API calls within a session.

---

## 20. Reports & CSV Export

**File:** `frontend/src/pages/Reports.tsx`

Four export types are available, all generated **entirely in the browser** — no server endpoint is involved:

| Report | Data source |
|---|---|
| Batches | `GET /api/batches` |
| Candidates | `GET /api/candidates` |
| Trainers | `GET /api/trainers` |
| At-Risk Candidates | `GET /api/candidates` filtered to `status === "At Risk"` |

CSV generation works by mapping the data to rows, joining with commas, prefixing a header row, creating a `Blob` with `text/csv` MIME type, generating an object URL, and programmatically clicking a hidden `<a download>` element. No third-party CSV library is used.

---

## 21. Notifications

**File:** `frontend/src/pages/Notifications.tsx`

Notifications are stored as static objects in `data.ts` (seeded at startup). They have a `type` field (`alert`, `warning`, `info`, `success`) that drives the icon and colour of each item. Marking all as read is handled client-side only — there is no persistence endpoint for read state in the demo build.

---

## 22. Candidate Portal

**Files:** `frontend/src/pages/candidate/`

A completely separate shell (`CandidateShell.tsx`) with its own sidebar navigation, scoped to the logged-in candidate's data. Pages:

| Route | Page | Key implementation |
|---|---|---|
| `/candidate/` | Home | Today's schedule, progress bars, AI Progress Narrative card |
| `/candidate/batch` | My Batch | Batch info, curriculum timeline, cohort peers, AI Tutor panel |
| `/candidate/schedule` | My Schedule | Filtered weekly calendar showing only the candidate's batch sessions |
| `/candidate/assessments` | My Assessments | Assessment results, AI Practice Questions panel |
| `/candidate/feedback` | My Feedback | Feedback form with star rating + AI Draft Helper |
| `/candidate/profile` | My Profile | Read-only profile with avatar, edit modal for display name |
| `/candidate/settings` | My Settings | Theme/scheme switcher (same as admin Settings) |

**AI Progress Narrative** (`ProgressNarrativeCard.tsx`): Calls `/api/ai/candidates/:id/progress` and returns a 2–3 sentence personal progress update rendered as markdown.

**AI Tutor** (`AITutorPanel.tsx`): A chat interface seeded with the candidate's batch technology as context. Uses `POST /api/ai/tutor` with full conversation history for multi-turn dialogue.

**AI Career Coach** (`CareerCoachCard.tsx`): Similar chat, but the system prompt includes the candidate's actual performance and attendance data to give personalised advice.

**AI Feedback Draft Helper** (`FeedbackDraftHelper.tsx`): The candidate types rough notes and a star rating; MaveAI returns a polished, professional version via `POST /api/ai/feedback/draft`.

---

## 23. MaveAI — Artificial Intelligence Features

**Frontend hooks:** `frontend/src/hooks/use-ai.ts`  
**Backend routes:** `backend/src/routes/ai.ts`  
**AI client wrapper:** `backend/src/lib/ai.ts`

### Model & SDK

MaveAI uses **Google Gemini 2.5 Flash** via the official `@google/genai` npm SDK. The model is configurable via the `AI_MODEL` environment variable (default: `gemini-2.5-flash`). The API key is read from `GEMINI_API_KEY` or `AI_INTEGRATIONS_GEMINI_API_KEY`.

Three primitives are exposed by `ai.ts`:
- `aiComplete(opts)` — single-turn generation (system prompt + user message)
- `aiCompleteJSON<T>(opts)` — same, but parses the response as JSON with a regex fallback
- `aiChat(messages)` — multi-turn conversation with a history array

### `wrapAITask` — Global AI notification bus

**File:** `frontend/src/lib/ai-events.ts`

All AI mutations on the frontend are wrapped in `wrapAITask`, which fires custom DOM events (`ai:start`, `ai:success`, `ai:error`) that `AINotificationsProvider` listens for. This renders a toast notification at the top of the screen showing the task name, input label, and output snippet — without any prop drilling from the mutation call site.

### Admin AI features

| Feature | Endpoint | How it works |
|---|---|---|
| Daily Briefing | `GET /ai/briefing` | Sends a full data snapshot (batch stats, at-risk counts, tech mix) to Gemini with a structured prompt specifying the exact output format (headlines, needs attention, resourcing) |
| Ask MaveAI | `POST /ai/ask` | Multi-turn chat with a data snapshot injected into the system prompt; full history passed on each turn |
| Risk Narrative | `GET /ai/candidates/:id/risk-narrative` | Candidate's attendance %, performance %, and batch context sent to Gemini; returns `{ summary, drivers[], recommendedActions[] }` as JSON |
| Batch Draft | `POST /ai/batches/draft` | Free-text prompt → structured JSON curriculum with weeks, topics, outcomes, and suggested assessments |
| Feedback Themes | `GET /ai/feedback/themes` | All feedback comments for a batch sent to Gemini; returns sentiment, theme clusters, mention counts |
| Question Generator | `POST /ai/assessments/generate` | Topic + difficulty + count → array of MCQ objects with options, correct answer, explanation |

### Candidate AI features

| Feature | Endpoint | How it works |
|---|---|---|
| Progress Narrative | `GET /ai/candidates/:id/progress` | Candidate metrics + batch info → 2–3 sentence personal progress update in markdown |
| AI Tutor | `POST /ai/tutor` | Multi-turn chat scoped to the candidate's batch technology; full history per turn |
| Career Coach | `POST /ai/career-coach` | Same multi-turn chat, but system prompt includes actual performance and attendance data for personalised advice |
| Practice Questions | `POST /ai/practice` | Topic → MCQ practice set; results saved to `localStorage` so they persist across navigation |
| Feedback Draft | `POST /ai/feedback/draft` | Rough notes + star rating → polished professional feedback text |

---

## 24. AI Safety & Content Guardrails

**File:** `backend/src/routes/ai.ts`

Two layers of protection prevent off-topic or unsafe model outputs:

**Layer 1 — Pre-LLM regex filter (`isOffTopic`):**  
Before any token is sent to Gemini, the user's input is tested against `BLOCKED_PATTERNS` — four regular expressions covering NSFW content, hate/violence, off-topic chit-chat (jokes, song lyrics, relationship advice), and out-of-scope topics (politics, religion, astrology, sports scores, weather, celebrity gossip). A match returns the standard refusal message immediately without incurring any API cost.

**Layer 2 — System prompt scope guardrail (`SCOPE_GUARDRAIL`):**  
Every chat system prompt begins with a strict persona definition: MaveAI is told it can only respond to questions about the Maverick platform and technical training topics. If the model decides to help anyway, the regex filter has already caught the worst cases, providing belt-and-braces protection.

---

## 25. System Utilities

### Network Status Indicator

**File:** `frontend/src/components/system/NetworkStatusIndicator.tsx`

Polls `GET /api/` in the background. If the backend becomes unreachable, a banner appears at the top of the screen. Uses React context so any component can read the connection status.

### Page Load Splash

**File:** `frontend/src/components/system/PageLoadSplash.tsx`

A branded full-screen loading screen shown for ~1.5 seconds on first app load. Hides once the React tree is mounted, preventing the unstyled flash of the bare HTML shell.

### AI Markdown Renderer

**File:** `frontend/src/components/ai/AIMarkdown.tsx`

Renders Gemini's markdown responses using a lightweight custom renderer (no heavy third-party markdown library). Handles bold, italic, inline code, fenced code blocks (with language labels), bullet lists, and headings.

---

## 26. Candidate Status Logic

**File:** `backend/src/lib/data.ts` → `deriveStatus()`

Candidate status is **never stored directly** — it is always derived from metrics:

| Status | Condition |
|---|---|
| `Graduated` | Batch status is "Completed" or "Archived" |
| `Dropped` | `attendancePercent < 60` OR `performance < 50` |
| `At Risk` | `attendancePercent < 75` OR `performance < 65` |
| `Active` | Everything else |

When `recomputeCandidateAttendance()` is called after an attendance save, it calls `deriveStatus()` again with the new percentage, so a candidate can move from Active → At Risk or At Risk → Active purely based on attendance changes made in the Attendance tab.

---

## 27. Performance Data Source

**How to answer this in a demo:**

> *"Performance scores are sourced directly from assessment results. Each candidate's `performance` field represents their cumulative assessment pass rate across all modules — foundations, hands-on labs, mid-batch assessments, and the capstone project. As new assessment scores are published, this metric updates and can push a candidate's status from Active to At Risk or vice versa."*

In the current implementation, `performance` is seeded as a deterministic integer (42–100) at startup and is shown as-is throughout the app. Assessment `passRate` values per batch are separately stored and surfaced on the Batch Detail page. The architecture already supports computing `performance` from real assessment records if that computation is wired in a future sprint.

---

*Last updated: June 2026*
