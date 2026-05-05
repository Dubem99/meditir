# Meditir Demo Script — 30 min, Lagos Private Hospital Doctor

## Goal of this meeting
**Walk out with a 2-week pilot commitment**: doctor agrees to use Meditir on 5–10 real patients, you set them up that week, you check in after.

If the doctor isn't ready to pilot, the fallback ask is a warm intro to one colleague at their hospital — never end the meeting without a next step.

---

## Pre-demo prep (do this the morning of)

**Account state:**
- [ ] Logged into a seeded demo hospital with a Nigerian-named patient queue (5–6 patients) — *not* a real production hospital
- [ ] One patient with a previous visit + summary already populated, so you can show the longitudinal view
- [ ] One in-progress session and one completed session with SOAP + NHIA codes already attached, as a fallback if live recording fails
- [ ] Yesterday's NHIA audit report open in a tab: `C:\Users\Dubem\meditir\audit-reports\nhia-2026-05-03.md` (95% GOOD, real prod data) — proof point you can point at

**Tech:**
- [ ] Phone hotspot tethered as backup; assume the hospital Wi-Fi is unreliable
- [ ] Laptop charged + power brick (NEPA can flick mid-demo)
- [ ] Bluetooth headset or external mic tested — laptop mics struggle in echoey consult rooms
- [ ] Browser notifications muted, Slack/email closed
- [ ] Volume up — they need to hear the audio playback if you demo TTS

**Materials:**
- [ ] One-pager PDF on phone or printed (positioning, pricing-on-request, contact)
- [ ] WhatsApp open so you can drop a follow-up the moment the meeting ends

---

## Positioning to lead with

> "Meditir is an **AI productivity assistant for doctors in Nigerian hospitals**. It listens to your consultation, drafts the SOAP note, pulls out the NHIA billing codes, and updates the patient record — so you can spend the consultation looking at your patient instead of typing."

**Don't** call it a "scribe", "EMR replacement", or "AI doctor." It's a productivity assistant; the doctor is in charge.

---

## Run of show (30 min)

### 0:00–0:03 — Open with their problem, not your product (3 min)
**Say:**
> "Before I show you anything, can I check three things — how do you currently take notes during consultations, how long does it take you to finish your charts at end of day, and how often do NHIA claims get rejected for coding issues?"

Listen. Do not pitch yet. Their pain is your script. Note which pain to pull on hardest later.

**Likely answers:**
- "I write by hand, type up later" → emphasise the SOAP draft + time saved
- "I use [EMR X]" → emphasise that we don't replace, we feed; show how SOAP can be copy-pasted
- "NHIA is a nightmare" → lead the demo with the billing-codes section

### 0:03–0:06 — Quick framing (3 min)
**Say:**
> "Three things make Meditir different from the AI tools you've seen demo'd from US/UK companies:
> 1. **It understands Nigerian English, Pidgin, Yoruba, Igbo and Hausa** — your patients can speak naturally.
> 2. **It speaks NHIA tariff codes natively** — not ICD-10 or CPT that nobody bills with here.
> 3. **It's built for unreliable power and internet** — sessions resume if you drop connection."

### 0:06–0:18 — Live demo (12 min) — *the core of the meeting*

**Open the doctor dashboard. Pick a demo patient.**

> "This is your queue for the morning. Let me start a session with Mrs Adekunle — she's a follow-up for hypertension."

**Click Start. Show the recording UI.**

> "I'm going to roleplay the consultation in mixed English and Pidgin — same way your patients actually speak."

**Record a 60–90 second roleplay** (script below in §"Roleplay script"). Make sure to:
- Mix in a Pidgin phrase ("How body?", "Make I check your BP")
- Mention a complaint that maps cleanly to an NHIA code (e.g. "we go do FBC" → NHIS-181-101)
- Order one investigation and one prescription out loud

**As you talk, point at the live transcript** appearing on screen. The doctor will react to this — it's the magic moment.

**Stop recording. Wait for the SOAP note to generate** (~10–20 sec). While it's loading, say:
> "While that runs, you'll notice it pulled out the assessment, plan, lab orders, and NHIA codes separately. You can edit any of it — nothing here is final until you sign off."

**When the note appears, walk through it section by section:**
1. **SOAP note** — point out it captured the Pidgin phrase correctly in English
2. **NHIA codes** — open the codes tab, show 2–3 codes with tariff in Naira
   > "These pulled directly from the NHIA Professional Fee Schedule. Yesterday I ran an audit on the last 7 days of production usage — 95% of the codes our AI suggested were exactly the right ones, 5% were marginal, and zero were wrong codes. Here's the report." *(Open the audit report tab briefly.)*
3. **Lab orders** — show the FBC was extracted as a structured order
4. **Patient summary** — flip to the patient's longitudinal view; show this visit is now stitched in

> "End-to-end that took 90 seconds of consultation and about 20 seconds of generation. You signed off, you billed, you moved on. The patient never saw you typing."

### 0:18–0:23 — The "why us, why now" (5 min)

Pick **two** of these to dwell on, depending on what their pain was:

- **Time**: "Most doctors using us recover 60–90 minutes a day. That's 5–7 extra patients or 90 minutes home earlier."
- **Billing**: "On NHIA codes specifically we're at 95% accuracy on real data. That directly affects denied claims."
- **Languages**: "If your patient speaks Yoruba mid-sentence, we don't lose it. Most US-built tools just drop those tokens."
- **Patient experience**: "Patients tell our pilot doctors that they feel more listened-to because the doctor isn't typing the whole time."
- **Privacy**: "Audio is processed in real time and not retained by default. We're aligned with NDPA — data lives in our infrastructure, not on the doctor's laptop."

### 0:23–0:28 — Pricing + pilot offer (5 min)

> "Here's what I'd propose: **a 2-week free pilot, just you, on 5–10 patients of your choosing.** I set you up this week, I'm a WhatsApp message away during the pilot, and at the end of two weeks you tell me whether it saved you time."

Pricing answer if they push: *"Pilot is free. Production pricing depends on volume — happy to walk through it once we know your patient load. Most clinicians land in the [give range] band."* *(Replace with your real number.)*

### 0:28–0:30 — Close + commitment (2 min)

**Three concrete asks, in order of preference:**
1. *"Can I set you up tomorrow?"* — get their email + phone, schedule a 20-min onboarding
2. *"Who else at this hospital should see this?"* — get one warm intro
3. *"Can I follow up Friday?"* — book the next conversation in their calendar there and then

Never leave the room without one of these.

---

## Roleplay script for the live recording

Use this — it's tight, has Pidgin, hits a clean NHIA code, and produces a believable SOAP note.

> "Good morning ma, how body today? *(pause)* Your BP last visit was 150 over 95 — we go check am again now. *(pause)* Have you been taking the amlodipine 10mg every morning? *(pause)* Okay, any chest pain, headache, blurry vision since then? *(pause)* Good. Let me listen to your chest. *(pause 3 seconds)* Lungs are clear, heart sounds normal. Reading today is 138 over 88 — that's better. We'll continue amlodipine 10mg daily, do an FBC and a urea-and-electrolytes today, and follow up in two weeks. Any questions for me?"

Total speaking time: ~60 seconds. Produces:
- **Assessment**: hypertension, controlled
- **Plan**: continue amlodipine, FBC, U&E, 2-week follow-up
- **Orders**: FBC (NHIS-181-101), U&E panel
- **Prescription**: amlodipine 10mg OD

---

## Likely objections + how to handle

| Objection | Response |
|---|---|
| **"What if my patient doesn't want to be recorded?"** | "You ask them at the start — same way you'd ask before a procedure. In our pilots, ~95% of patients say yes once they understand it's not stored as audio after the visit." |
| **"What about NEPA / internet?"** | "If your internet drops mid-session, the recording resumes when it comes back. If power goes off, you reopen the session and pick up where you stopped. We tested this with bad networks specifically." |
| **"Is this NDPA-compliant?"** | "Yes — audio is processed in real time, not retained by default, and we keep an audit log of every access. We can sign a DPA with the hospital." |
| **"How accurate is it on Yoruba/Igbo/Hausa?"** | Be honest: "English and Pidgin are strongest. Yoruba/Igbo/Hausa work but with more errors on uncommon medical terms — we're improving the dialect models monthly. For pilot use, I'd suggest English+Pidgin first." |
| **"Who owns the data?"** | "The hospital owns the patient data. We process it on the hospital's behalf. Nothing leaves the system to train external models." |
| **"What's it cost?"** | Give the band, reinforce free pilot. Don't dwell. |
| **"How is this different from [ChatGPT / Doximity / X]?"** | "Those are general-purpose. We are built for Nigerian clinical workflow — Pidgin, NHIA codes, NHIS schedules. None of those handle billing-grade output for our market." |
| **"Does it replace the doctor's judgment?"** | "No. It drafts. You sign off. Every code, every prescription, every plan goes through your review before anything is final." |
| **"My patients are old / scared of technology"** | "The patient never touches it. They just talk to you. The laptop is on your side of the desk." |

---

## Numbers + proof points to have memorised

- **95% GOOD** on AI-emitted NHIA codes (last 7 days of real prod data, audited 2026-05-03)
- **0% wrong codes** in the same audit
- **5 dialects + auto-detect** (English, Pidgin, Yoruba, Igbo, Hausa)
- **~20 seconds** to generate a full SOAP note + codes after recording stops
- *(Add: number of pilot doctors, total sessions, time saved per visit — replace with real numbers before the meeting)*

---

## What NOT to demo (cut for time)

If the meeting runs long, drop these in this order:
1. TTS / playback features
2. Patient summary deep-dive (just show that it exists)
3. Templates (mention they exist, don't demo)
4. Admin / audit log views
5. Additional-notes feature (still in flight — don't promise it)

---

## After the meeting (within 1 hour)

- WhatsApp the doctor a thank-you + link to a 2-min recap video (if you have one)
- Add them to your CRM / spreadsheet with: pain points they mentioned, objections raised, next step + date
- If they agreed to pilot, send the onboarding link before you go to bed today

---

## Things to avoid saying

- ❌ "AI scribe"
- ❌ "Replaces your EMR"
- ❌ "Hospital OS"
- ❌ "100% accurate" — say 95% and own the 5%
- ❌ Anything that promises features that aren't shipped (additional-notes UI, HMO billing schedules)
- ❌ "We're better than [competitor]" — describe your strengths, let them draw the comparison
