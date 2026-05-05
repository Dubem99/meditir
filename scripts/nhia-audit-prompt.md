# NHIA Tariff Code Accuracy Audit

You are auditing whether NHIA billing codes emitted on Meditir's production
database actually match the underlying clinical context. **Read-only audit, no
code changes.**

You will be given three sections below:
1. Window totals — count of all NHIA codes in the last 7 days, broken down by source
2. Sampled rows — up to 20 NHIA billing rows joined with their SOAP assessment/plan and (if present) the linked order
3. Canonical catalog — the full `NHIA_TARIFF_FULL` from `meditir-api/src/data/nhia-tariff.ts`

## How to judge each sampled row

Compare the chosen `code` + `description` against the underlying clinical context (`assessment`, `plan`, `order_name`, `order_type`, `instructions`). For each row, classify it as one of:

- **GOOD** — code matches the service described (e.g., FBC ordered → NHIS-181-101 FBC)
- **WRONG_CODE** — code exists in the catalog but doesn't match the actual service (e.g., chest X-ray ordered, but a different imaging code was selected)
- **MARGINAL** — close, but a more specific match exists in the catalog
- **DOCTOR_OVERRIDE** — `source = 'DOCTOR_ADDED'`. **Exclude from accuracy stats.** Doctor's manual choice is not what we're auditing.

Rows where `source = 'DOCTOR_EDITED'` count as AI-emitted for accuracy purposes (the AI suggested it; the doctor only tweaked metadata).

## Required output (≤400 words, markdown)

1. **Window totals** — total NHIA codes in window, AI-emitted vs. doctor-added.
2. **Accuracy** — GOOD / WRONG_CODE / MARGINAL percentages on AI-emitted only (exclude DOCTOR_ADDED). Show the count and the percentage.
3. **Worst examples (2–3)** — for each, quote the SOAP assessment/plan or order verbatim, the chosen code, and what the correct code from the catalog should have been.
4. **Patterns** — any systematic miscoding (e.g., a specific service consistently mapped to the wrong code).
5. **Verdict** — one line, exactly one of: `shipping safely` / `needs prompt tuning` / `broken — investigate`.
6. **Action** — if accuracy is below 70% GOOD on AI-emitted codes, flag urgently and suggest 1–2 concrete prompt changes to fix the most common failure mode. Otherwise, write `No action needed.`.

If the sampled rows array is empty, output: "No NHIA codes in the last 7 days — nothing to audit." and stop.

---
