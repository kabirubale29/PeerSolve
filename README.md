# PeerSolve — Academic Doubt-Solving Forum

> **Turn repetitive private academic doubts into reusable university knowledge.**

PeerSolve is an educational community platform where students can search existing doubts, ask new questions (with optional anonymity), receive peer and senior mentor answers, benefit from advisory AI verification powered by Google Gemini, and build verified reputation through atomic PostgreSQL triggers.

---

## 🌟 Core Differentiators & Highlights

1. **Advisory Similar Doubt Detection**:
   - As you type your doubt title (debounced 500ms, triggers after 15+ characters), a live semantic similarity check searches the knowledge base.
   - Shows top matches with `✓ Solved` or `Open` status badges and match percentages.
   - **Non-blocking guarantee**: Never blocks or gates the "Post Question" button. Includes explicit *"None of these help — continue asking"* path with optional soft-linking via `related_question_ids`.
2. **Anonymous Asking & Answering with True Privacy**:
   - Single authenticated university account with a per-post "Post anonymously" toggle.
   - Anonymous author identities are sanitized and completely stripped at the API layer — never leaked to client JSON responses.
   - Reputation still accrues to the real account behind the scenes via atomic PostgreSQL triggers.
3. **Senior Mentor Discovery & Trust Signals**:
   - Automatic classification: Years 1–2 = `Junior Peer`, Years 3–4+ = `Senior Mentor`.
   - Dedicated "Unanswered" feed tab allows seniors to quickly discover doubts they can mentor.
4. **Advisory AI Verification (Gemini)**:
   - Evaluates factual correctness, logical consistency, and missing edge cases.
   - Color-coded advisory badges: 🟢 `AI Reviewed`, 🟡 `Needs Review`, 🔴 `Potential Issue`, `AI Review Unavailable`.
   - **Re-runs automatically upon answer edit**.
   - Advisory only — never auto-deletes flagged answers.
5. **AI Assistant → Forum Knowledge Loop**:
   - Dedicated interactive AI doubt-solving assistant.
   - Follow-up prompts: *"Did this solve your doubt?"* -> *"Share this with the student community?"* -> **[Post to Forum]**.
   - Pre-fills the Ask Question form with AI-refined title, description, subject, and tags for 1-click community sharing.
6. **"✨ Improve with AI" Question Polishing**:
   - Analyzes draft question and suggests improved title, structured description, subject, and tags.
   - **Requires explicit user approval** before applying changes.
7. **Atomic Reputation & Abuse-Resistant Moderation**:
   - Strict database triggers for atomic score calculation (Question upvote: +2, Answer upvote: +5, Answer downvote: -2, Answer accepted: +25).
   - Prevents users from voting on their own content.
   - Prevents users from accepting their own answer to prevent reputation farming.
   - 1 report per user per answer limit. Answers with 3+ reports are visually flagged as **"Under Review"** (visible, not hidden).

---

## 🏗️ Architecture

```
peersolve/
├── server/                       # Node.js (Express) AI backend & proxy
│   ├── config/constants.js       # Rep values, role cutoffs, subjects, badges
│   ├── database/
│   │   ├── schema.sql            # Full PostgreSQL DDL (pgvector, RLS, triggers)
│   │   ├── seed.sql              # Precomputed 768-dim embeddings & realistic students
│   │   └── generate_seed.js      # Seed generator
│   ├── middleware/
│   │   ├── auth.js               # Supabase JWT & demo auth
│   │   └── rateLimiter.js        # Express rate limiter for AI calls
│   ├── routes/
│   │   ├── ai.routes.js          # Similar questions, verification, chat, question polishing
│   │   ├── questions.routes.js   # Question CRUD & privacy masking
│   │   ├── answers.routes.js     # Answer CRUD, accept flow, sorting
│   │   ├── votes.routes.js       # Up/Down voting & atomic reputation
│   │   ├── comments.routes.js    # Flat lightweight comments
│   │   ├── reports.routes.js     # Report answers & abuse threshold
│   │   ├── notifications.routes.js # Notifications & mark as read
│   │   └── users.routes.js       # Profile, stats, badges, demo user switcher
│   ├── services/
│   │   ├── gemini.service.js     # Google Gemini SDK integration with 7s timeout
│   │   ├── supabase.js           # Supabase client
│   │   └── mockData.js           # High-fidelity in-memory store & privacy sanitizer
│   └── index.js                  # Express app entry & /api/health endpoint
│
└── client/                       # React (Vite) + Tailwind CSS
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Supabase Auth & Instant Demo User Switcher
    │   │   └── ToastContext.jsx  # Alert toasts
    │   ├── components/
    │   │   ├── common/           # RoleBadge, ReputationBadge, AIReviewBadge, VoteButtons
    │   │   ├── layout/           # Navbar (search, switcher), Sidebar, Footer
    │   │   ├── questions/        # QuestionCard, SimilarQuestionsPanel, FilterTabs
    │   │   ├── answers/          # AnswerCard, AnswerForm, CommentSection, ReportModal
    │   │   └── ai/               # AIImproveButton, AIAssistantWidget
    │   └── pages/
    │       ├── LandingPage.jsx   # Public pre-login marketing page
    │       ├── LoginPage.jsx & SignupPage.jsx
    │       ├── OnboardingPage.jsx # Name, Year, Branch -> Junior/Senior
    │       ├── DashboardPage.jsx # "Search before you ask", feed tabs, filters
    │       ├── AskQuestionPage.jsx # Similar detection & non-blocking posting
    │       ├── QuestionDetailPage.jsx # Question, answers, accept flow, comments
    │       ├── AIAssistantPage.jsx # AI chat & "Post to Forum" workflow
    │       ├── ProfilePage.jsx   # Badges, reputation, stats, privacy guarantee
    │       └── NotificationsPage.jsx # Notification center with mark-as-read
```

---

## 🚀 Quick Start (Single Command)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment (Optional)
Copy `.env.example` in `server/`:
```bash
cp server/.env.example server/.env
```
Fill in:
- `GEMINI_API_KEY`: Your Google Gemini API key (from https://aistudio.google.com/)
- `SUPABASE_URL`: Your Supabase Project URL
- `SUPABASE_ANON_KEY`: Your Supabase Anon Key

*(Note: PeerSolve includes an integrated mock/demo engine, so you can boot and test the complete app immediately even before external API keys are configured!)*

### 3. Run Both Server & Client
```bash
npm run dev
```
- **Client**: `http://localhost:5173`
- **Server**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🧪 Run Automated Tests
```bash
node test_api.js
```
Runs 12 automated assertions verifying health, similarity detection, self-vote prevention, self-accept prevention, anonymous privacy masking, and notification updates.

---

## 🎬 Hackathon Demo Flow (Step-by-Step)

1. **Public Landing**:
   - Open `http://localhost:5173/` as a first-time visitor.
   - Review Hero, Problem Framing, 4-Step Knowledge Loop, and Key Features.
2. **Junior Student Doubt Search & Advisory Similar Check**:
   - Click "Get Started" or log in as **Rahul Sharma (Junior)**.
   - In the Ask Question page, type: *"What is polymorphism in Java?"*
   - Watch the **Similar Questions Found** panel display top matching doubts with `✓ Solved` or `Open` tags.
   - Click *"None of these answer my question — continue asking"*. Notice that posting is never blocked.
   - Check the **"Post anonymously"** toggle and submit.
3. **Senior Mentor Answering**:
   - Switch role to **Priya Patel (Senior Mentor)** via the top-right navbar menu.
   - Navigate to the **"Unanswered"** tab on the Dashboard.
   - Write an answer to a doubt.
   - Observe the live **🟢 AI Reviewed** badge (or review the deliberate 🔴 Potential Issue example on binary search).
4. **Community Validation & Reputation**:
   - Upvote the answer from a peer account.
   - Switch back to the original asker -> Click **Accept Answer**.
   - Notice: Question status becomes **✓ Solved**, answer pins to the top, answerer receives **+25 Reputation**, and a notification fires.
5. **AI Assistant → Post to Forum**:
   - Open **AI Assistant** from the navbar.
   - Ask: *"Explain TCP 3-Way Handshake step by step"*.
   - Review the AI answer -> Click *"Yes, I'm satisfied"* -> Click **[Post to Forum]**.
   - The Ask Question form opens pre-filled with the title, description, subject, and tags. Edit and publish!
