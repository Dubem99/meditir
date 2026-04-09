# Meditir — AI-Powered Medical Consultation Platform

Meditir is a multi-tenant, HIPAA-oriented clinical documentation platform for Nigerian hospitals. It automates the most time-consuming part of a doctor's workflow: writing notes after a consultation.

```
Doctor speaks → Real-time transcript → Claude generates SOAP note → Doctor reviews & signs
```

---

## Architecture Overview

```
meditir/
├── meditir-api/         # Node.js + Express + TypeScript backend
├── meditir-web/         # Next.js 15 frontend
└── docker-compose.yml   # Local development stack
```

### Stack Decisions (Build vs. Buy)

| Concern | Decision | Rationale |
|---|---|---|
| **Speech-to-Text** | Browser Web Speech API | Zero latency, no audio upload bandwidth, works offline. Whisper fallback planned for structured audio upload. |
| **SOAP Note Generation** | Claude (Anthropic) | Best-in-class medical reasoning, structured JSON output, Nigerian dialect awareness via system prompt. |
| **Text-to-Speech** | ElevenLabs | High-quality multilingual audio for patient note readback. |
| **Auth** | Custom JWT (no Auth0) | Full control over tenant isolation, token rotation, audit logs. Hospital slug is embedded in token claims. |
| **Database** | PostgreSQL + Prisma | Strong relational guarantees for PHI, schema-enforced tenant isolation via `hospitalId` FK on every clinical model. |
| **Real-time** | Socket.io | Live transcript streaming with room-based isolation per session. |
| **Offline** | IndexedDB (Dexie) + sync queue | Doctors in low-connectivity environments still capture transcripts; background sync on reconnect. |

---

## Multi-Tenancy Model

Every clinical record — sessions, transcriptions, SOAP notes — carries a `hospitalId` foreign key. The backend enforces this at every query via the `resolveTenant` middleware, which extracts `hospitalId` from the authenticated user's JWT claims.

```
Hospital (tenant)
└── Users (HOSPITAL_ADMIN, DOCTOR, PATIENT)
    ├── AdminProfile
    ├── Doctor → ConsultationSession → Transcription → SOAPNote
    └── Patient → ConsultationSession → SOAPNote
```

Hospital admins cannot query or mutate data across tenant boundaries — the API enforces `WHERE hospitalId = :jwt.hospitalId` on every data access.

---

## Security & Compliance Design

### Authentication
- **Access tokens**: 15-minute JWT, RS256-signed, hospital + role claims
- **Refresh tokens**: 7-day, single-use with rotation (old token revoked on refresh)
- **Audit log**: every login, logout, SOAP generation, and finalization is written to `AuditLog`

### Data Protection
- Passwords: bcrypt (cost factor 10)
- Transport: HTTPS enforced in production via Helmet CSP + HSTS
- PHI fields never logged — Winston logger strips sensitive payloads
- Cookie signing via `COOKIE_SECRET`

### HIPAA Readiness Checklist
- [x] Tenant data isolation at the ORM query level
- [x] Audit trail for all PHI access (AuditLog table)
- [x] Signed clinical notes (doctorSignedAt timestamp)
- [x] Role-based access control (SUPER_ADMIN / HOSPITAL_ADMIN / DOCTOR / PATIENT)
- [x] Refresh token revocation
- [ ] At-rest encryption: enable PostgreSQL TDE or use RDS encryption at rest in production
- [ ] BAA: required with any cloud provider handling PHI (Railway, Vercel, AWS)
- [ ] Audit log export endpoint for compliance reporting

---

## Local Development

### Prerequisites
- Node.js 20+
- Docker + Docker Compose (for Postgres)

### 1. Start the database

```bash
docker-compose up postgres -d
```

### 2. Configure the API

```bash
cd meditir-api
cp .env.example .env
# Edit .env — at minimum set:
#   ANTHROPIC_API_KEY=sk-ant-...
#   JWT_ACCESS_SECRET=<32+ random chars>
#   JWT_REFRESH_SECRET=<different 32+ random chars>
#   COOKIE_SECRET=<16+ random chars>
```

Generate secrets quickly:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Run migrations and seed

```bash
cd meditir-api
npm install
npm run db:generate
npm run db:migrate
npm run db:seed      # creates a SUPER_ADMIN + demo hospital
```

### 4. Start the API

```bash
npm run dev          # http://localhost:4000
```

### 5. Configure and start the frontend

```bash
cd ../meditir-web
cp .env.example .env.local
# .env.local defaults work for local dev
npm install
npm run dev          # http://localhost:3000
```

---

## Production Deployment

### Recommended Stack
- **API**: Railway (Dockerfile included) or any Node.js host
- **Web**: Vercel (vercel.json included)
- **Database**: Railway Postgres or AWS RDS

### Docker (full stack)

```bash
# Copy and edit the API env
cp meditir-api/.env.example meditir-api/.env
# Set ANTHROPIC_API_KEY, JWT secrets, COOKIE_SECRET, ALLOWED_ORIGINS

docker-compose up --build
```

The `start` script in `meditir-api/package.json` runs `prisma migrate deploy` before starting the server, so migrations are applied automatically on container start.

### Environment Variables Reference

#### API (`meditir-api/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes | Min 32 chars, random |
| `JWT_REFRESH_SECRET` | Yes | Min 32 chars, different from access |
| `COOKIE_SECRET` | Yes | Min 16 chars |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `ALLOWED_ORIGINS` | Yes | Comma-separated frontend origins |
| `ELEVENLABS_API_KEY` | No | Required for TTS feature |
| `ELEVENLABS_VOICE_ID` | No | Required for TTS feature |
| `CLAUDE_MODEL` | No | Default: `claude-sonnet-4-6` |

#### Web (`meditir-web/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL, e.g. `https://api.meditir.com/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL, e.g. `https://api.meditir.com` |
| `NEXT_PUBLIC_TTS_ENABLED` | Set to `false` to hide TTS UI |

---

## User Roles & Flows

### SUPER_ADMIN
- Registers new hospitals via `/superadmin/hospitals/new`
- Views platform-wide hospital list, stats, and toggles hospital active state
- Accesses all audit logs

### HOSPITAL_ADMIN
- Created automatically when a hospital registers
- Onboards doctors and patients via `/admin/onboarding`
- Views all doctors, patients, and sessions in their hospital
- **Cannot** see another hospital's data

### DOCTOR
- Starts consultations (creates patient on the fly or uses existing)
- Records audio → live transcript via Web Speech API
- Ends session → Claude generates SOAP note automatically
- Reviews and edits each SOAP section inline
- Finalizes (signs) the note

### PATIENT
- Views their own consultation notes
- Listens to TTS audio readback (if ElevenLabs configured)

---

## API Reference

Base path: `/api/v1`

| Method | Path | Role | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new hospital + admin |
| POST | `/auth/login` | Public | Login, get access + refresh tokens |
| POST | `/auth/refresh` | Authenticated | Rotate refresh token |
| POST | `/auth/logout` | Authenticated | Revoke refresh token |
| GET | `/hospitals/me/stats` | HOSPITAL_ADMIN | Own hospital stats |
| GET | `/hospitals/:id/stats` | SUPER_ADMIN, HOSPITAL_ADMIN | Hospital stats |
| GET | `/doctors` | HOSPITAL_ADMIN, DOCTOR | List hospital doctors |
| POST | `/doctors` | HOSPITAL_ADMIN | Onboard a doctor |
| GET | `/patients` | HOSPITAL_ADMIN, DOCTOR | List hospital patients |
| POST | `/patients` | HOSPITAL_ADMIN, DOCTOR | Register a patient |
| GET | `/sessions` | HOSPITAL_ADMIN, DOCTOR | List sessions (doctors see own only) |
| POST | `/sessions` | DOCTOR | Create session |
| POST | `/sessions/:id/start` | DOCTOR | Start session, issue roomToken |
| POST | `/sessions/:id/end` | DOCTOR | End session, triggers SOAP generation |
| POST | `/soap-notes/:id/generate` | DOCTOR | (Re)generate SOAP from transcript |
| PATCH | `/soap-notes/:id` | DOCTOR | Edit a SOAP section |
| POST | `/soap-notes/:id/finalize` | DOCTOR | Sign the note |
| POST | `/tts/:noteId` | DOCTOR, PATIENT | Generate TTS audio |
| GET | `/admin/audit-logs` | HOSPITAL_ADMIN, SUPER_ADMIN | Audit trail |

### WebSocket Events

Connect to `NEXT_PUBLIC_SOCKET_URL`. Authenticate by emitting `join:session` with your access token and the session's `roomToken`.

| Event (emit) | Payload | Description |
|---|---|---|
| `join:session` | `{ roomToken, accessToken }` | Join consultation room |
| `transcription:text_segment` | `{ sessionId, text, dialect, speakerTag, startMs }` | Send a finalized speech segment |
| `leave:session` | `roomToken` | Leave room |

| Event (on) | Payload | Description |
|---|---|---|
| `joined:session` | `{ sessionId, roomToken }` | Confirmed joined |
| `transcription:new_segment` | `{ id, text, speakerTag, startMs, createdAt }` | New segment broadcast to room |
| `error` | `{ message }` | Auth or session error |

---

## Extending the Platform

### Adding a new AI feature
1. Add a new service in `meditir-api/src/modules/` following the existing pattern (service → controller → routes)
2. Mount the router in `app.ts`
3. Update `AuditLog` writes for any PHI-accessing operation

### Upgrading to Whisper STT
The current transcription uses the browser's Web Speech API. To switch to server-side Whisper:
1. Add `openai` package to `meditir-api`
2. Create `meditir-api/src/modules/transcription/whisper.service.ts`
3. Add a `POST /transcriptions/audio` endpoint that accepts `multipart/form-data`, forwards to Whisper, and emits the result back via Socket.io

### Adding S3 for TTS audio storage
In `meditir-api/src/modules/tts/tts.service.ts`, replace the base64 return value with an S3 `putObject` call and return the CDN URL. Update the `SOAPNote.ttsAudioUrl` field accordingly.

---

## Seed Data

Running `npm run db:seed` creates:
- `superadmin@meditir.com` / `Meditir@SuperAdmin2024!` — SUPER_ADMIN
- `admin@lagosgeneral.ng` / `Admin@2024!` — HOSPITAL_ADMIN for "Lagos General Hospital"
- `dr.adeola@lagosgeneral.ng` / `Doctor@2024!` — DOCTOR
- `patient@example.ng` / `Patient@2024!` — PATIENT

The frontend "Continue with Demo Account" button bypasses auth entirely for local demos.
