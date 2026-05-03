# Patient Consent + Privacy Policy Copy — STT Phase 1 (Architecture A)

Use this language to update Meditir's patient consent form and privacy policy
when shipping the gpt-4o-transcribe-based transcription. **Have your legal
counsel review before deploying to production.** This is a draft, not legal
advice.

Architecture A means: audio is captured at the doctor's device, streamed to
OpenAI for transcription, the resulting text is saved as the clinical
record, and the audio is discarded. Audio is never persisted on Meditir or
OpenAI's side beyond processing.

---

## Short consent copy (in-clinic, at point-of-care)

Patient-facing checkbox or signed acknowledgement at first visit:

> **AI-Assisted Documentation Consent**
>
> During your visit, your conversation with the doctor will be recorded
> briefly so an AI service can transcribe it into your clinical note.
> The audio is processed by OpenAI (a third-party AI provider) and is not
> retained — only the written transcript becomes part of your medical record.
> No audio recording is stored or shared with anyone outside your care team.
>
> You can decline this at any time. If you decline, the doctor will write
> your note manually as usual.
>
> ☐ I consent to AI-assisted transcription of this and future visits.
> ☐ I do NOT consent (the doctor will document manually).

---

## Privacy Policy section (long-form)

Add to Meditir's privacy policy under "How we process your data":

### Audio processing for clinical documentation

When you visit a doctor using Meditir, the doctor may use Meditir's
AI-assisted transcription feature to convert the audio of your consultation
into a written clinical note. This processing works as follows:

- **Capture**: audio is recorded on the doctor's device during the visit.
- **Transmission**: short audio segments are sent over an encrypted
  connection (HTTPS / TLS 1.2+) to OpenAI, an AI service provider, for
  transcription.
- **Transcription**: OpenAI's gpt-4o-transcribe model converts the audio
  into text. Per OpenAI's published API terms, this audio is not used to
  train AI models and is not retained beyond the time required to process
  the request.
- **Storage**: the resulting text transcript is saved to your medical record
  in Meditir's encrypted database. **The audio itself is not retained** by
  Meditir or by OpenAI.
- **Use**: the transcript is used to generate your structured clinical note
  (SOAP note), which the doctor reviews and finalizes. The transcript and
  finalized note are visible only to authorized clinical staff at your
  hospital.

### Lawful basis (NDPA)

We rely on your **explicit consent** (NDPA Article 26) as the lawful basis
for AI-assisted transcription. You may withdraw consent at any time by
informing your doctor or the records office of your hospital. Withdrawal
applies to future visits; transcripts generated before withdrawal remain
part of your clinical record (which we are required to retain under
Nigerian medical record-keeping rules).

### Cross-border data transfer (NDPA Article 41)

OpenAI's processing infrastructure is located outside Nigeria (currently in
the United States and European Union). The audio leaves Nigeria for the
brief period of transcription processing only. We rely on:
- Standard contractual safeguards in our Data Processing Agreement (DPA)
  with OpenAI;
- OpenAI's enterprise-grade security certifications (SOC 2 Type II,
  ISO 27001);
- The audio not being retained after processing.

If you do not consent to your audio being processed outside Nigeria, your
doctor will document your visit manually using Meditir's standard
note-taking interface (no audio is captured in that case).

### Your rights

Under the Nigeria Data Protection Act 2023, you have the right to:
- access the transcripts and clinical notes generated about you;
- correct inaccuracies in those records;
- request deletion of records (subject to medical record retention
  requirements);
- withdraw consent for future AI-assisted transcription at any time.

Contact your hospital's records officer to exercise these rights.

---

## What is NOT covered by this consent

This consent does not authorize:
- audio recording for purposes other than clinical documentation;
- retention of audio recordings;
- sharing of audio or transcripts with third parties (other than the AI
  transcription service for the brief processing period);
- use of your data to train AI models.

These are NDPA non-negotiables. If we ever want to do any of these (e.g.
retain audio to fine-tune a Nigerian medical AI model), we will need an
**additional, separate, opt-in consent** from each patient covering that
specific purpose. That's a Phase 2 conversation.

---

## Implementation checklist for hospitals

Before turning on STT for a hospital:

- [ ] Hospital has signed an updated Meditir BAA / DPA covering OpenAI
      sub-processing
- [ ] Hospital has updated their patient intake form to include the AI
      consent checkbox above
- [ ] Hospital records officer has been briefed on the right-to-withdraw
      flow
- [ ] Doctor has been trained on what to do if a patient declines
      (use manual note interface; no audio capture)
- [ ] Privacy policy on hospital's patient-facing materials has been
      updated to reference AI-assisted documentation

---

## Phase 2 note (audio retention for fine-tuning)

When/if Meditir ships Architecture B (audio retained for fine-tuning a
Meditir-specific model), the consent copy will need to be updated to
disclose:
- audio retention duration (e.g. 5 years aligned with medical record norms)
- purpose (improving Meditir's transcription quality for Nigerian medical
  conversations)
- the encryption + access controls protecting retained audio
- Meditir's commitment to data residency (e.g., audio stored in Nigerian or
  African region)

Until that consent is collected, **only the no-retention path is
authorized**. The implementation has a `hospital.audio_retention_enabled`
boolean (Phase 2) that gates retention per hospital — defaults to `false`.
