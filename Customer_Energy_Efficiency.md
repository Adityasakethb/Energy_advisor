# Product Requirements Document (PRD)
## UC-26: Customer Energy Efficiency Advisor (Agentic AI)

| Field | Value |
|---|---|
| Use Case ID | UC-26 |
| Industry | Utilities |
| Function | Customer Engagement |
| Solution Type | Agentic AI |
| Owner | CX Head |
| Build/Buy | Build (inspired by Opower's proven model) |
| Complexity | Low |
| Target Timeline | 4–6 weeks (production) / **1 day (MVP prototype — see Section 13a)** |
| Primary Risk | Privacy / Data Protection |
| Target Impact | 10–15% demand reduction among engaged customers |
| Document Status | Ready for engineering handoff |
| Version | 1.0 |
| Last Updated | July 15, 2026 |

---

## 1. Executive Summary

Utility customers today have no intuitive way to understand their own energy usage patterns. They receive a monthly bill with a total dollar figure but no insight into *why* usage spiked, *what* is driving cost, or *how* to reduce it. This blind spot leads to wasted energy, avoidable peak-demand strain on the grid, and low customer engagement with efficiency programs.

The **Customer Energy Efficiency Advisor** is an agentic AI system that continuously analyzes a customer's interval usage data (smart meter data), detects patterns and anomalies, and proactively delivers **personalized, actionable, plain-language energy-saving recommendations** through the utility's app, web portal, and email/SMS channels. Unlike a static dashboard, the agent behaves autonomously: it monitors usage on a schedule, decides when a recommendation is worth surfacing, drafts the explanation, personalizes it to the household profile, and tracks whether the customer acted on it — closing the loop and adapting future suggestions.

This mirrors the proven Opower behavioral-efficiency model (home energy reports, neighbor comparisons, usage alerts) but reimplements it as an **LLM-driven agent** capable of natural-language conversation, dynamic reasoning over usage data, and self-directed recommendation generation rather than fixed rule-based templates.

**Goal:** Reduce customer demand by 10–15% among actively engaged users within 2 quarters of launch, while maintaining strict data privacy compliance.

---

## 2. Problem Statement

- Customers cannot see or interpret their own usage patterns (time-of-day spikes, seasonal drift, appliance-level waste).
- Existing utility communications (paper bills, generic tips emails) are generic, infrequent, and not personalized — engagement rates are low (<5% open-to-action typically).
- Utilities need to shift demand, especially during peak hours, but lack a scalable way to nudge individual behavior at low cost.
- Customer service teams are unable to proactively answer "why was my bill high this month?" without a manual investigation.

## 3. Goals & Non-Goals

### Goals
1. Autonomously analyze each customer's usage data on a recurring cadence (daily ingestion, weekly/monthly insight generation).
2. Generate personalized, explainable savings recommendations grounded in the customer's actual data (not generic tips).
3. Deliver recommendations through customer's preferred channel (in-app, email, SMS).
4. Allow conversational Q&A: customers can ask "why was my bill higher this month?" and get a data-grounded answer.
5. Track recommendation-to-action conversion and feed outcomes back into personalization.
6. Achieve 10–15% measurable demand reduction in the engaged cohort within 2 quarters.

### Non-Goals (v1)
- No direct control of smart-home devices/thermostats (informational only, not automation) — reserved for a future phase.
- No dynamic real-time pricing negotiation or automated demand-response enrollment (can recommend enrollment, not auto-enroll).
- No multi-utility / cross-account benchmarking beyond anonymized neighbor comparison.

## 4. Target Users & Personas

| Persona | Description | Primary Need |
|---|---|---|
| **Residential Customer** | Homeowner/renter receiving monthly bills | Understand usage, lower bill, easy tips |
| **CX Head (internal)** | Owns customer engagement KPIs | Engagement rate, demand-reduction reporting |
| **Customer Service Rep (internal)** | Handles inbound billing questions | Quick access to AI-generated usage explanation to reduce handle time |
| **Program Manager (internal)** | Runs efficiency/DR programs | Needs qualified leads (customers likely to enroll in programs) |

## 5. Success Metrics (KPIs)

| Metric | Target | Measurement |
|---|---|---|
| Demand reduction (engaged cohort) | 10–15% | kWh usage YoY/period-over-period, engaged vs. control group |
| Recommendation engagement rate | >25% open/view rate | Notification/email analytics |
| Recommendation action rate | >10% of viewed recs acted upon | Self-reported + usage-delta validation |
| Conversational query resolution rate | >80% answered without human escalation | Agent session logs |
| Customer opt-in / privacy consent rate | >90% of eligible customers | Consent DB |
| Reduction in "why is my bill high" CSR calls | -20% | CSR ticket tagging |
| P95 recommendation generation latency | <5 seconds (batch), <3 seconds (chat) | System telemetry |

---

## 6. Solution Overview — Agentic Architecture

The system is composed of a **primary orchestrator agent** plus **specialized sub-agents/tools**, each with a narrow responsibility. This is deliberately modular so Antigravity (or any build agent) can implement, test, and deploy each component independently.

```
                     ┌─────────────────────────────┐
                     │   Usage Data Ingestion       │
                     │   (Smart Meter / AMI feed)   │
                     └──────────────┬───────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │  Data Normalization Service  │
                     │  (interval → daily/monthly)  │
                     └──────────────┬───────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │   Pattern & Anomaly Engine   │  (deterministic stats,
                     │   (non-LLM, rule/stat based) │   NOT an LLM — for trust)
                     └──────────────┬───────────────┘
                                    │  structured "signals" JSON
                                    ▼
              ┌───────────────────────────────────────────┐
              │       Orchestrator Agent (LLM-based)        │
              │  - Decides which signals merit a message    │
              │  - Calls sub-tools below                     │
              │  - Maintains customer context/session state  │
              └───┬───────┬───────────┬───────────┬─────────┘
                  │       │           │           │
                  ▼       ▼           ▼           ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐
        │Recommend-│ │Neighbor  │ │Explainer │ │Program Matching │
        │ation Tool│ │Compare   │ │Q&A Tool  │ │Tool (DR/rebates)│
        └──────────┘ └──────────┘ └──────────┘ └────────────────┘
                  │
                  ▼
        ┌─────────────────────────────┐
        │  Delivery Orchestration      │
        │  (Push/Email/SMS/In-app)     │
        └──────────────┬───────────────┘
                        │
                        ▼
        ┌─────────────────────────────┐
        │  Feedback & Outcome Tracker  │──► feeds back into
        │  (did usage change? did      │    personalization
        │   customer act on rec?)      │    model
        └─────────────────────────────┘
```

**Design principle:** The agent never invents numbers. All quantitative claims ("you used 18% more than last month") come from the deterministic Pattern & Anomaly Engine. The LLM's job is *reasoning about which insight matters* and *explaining it in natural language* — not computing statistics itself. This is critical for accuracy and auditability in a regulated utility context.

---

## 7. Detailed Functional Requirements

### 7.1 Data Ingestion & Normalization
- **FR-1.1:** Ingest interval usage data (15-min or hourly AMI reads) via batch file (CSV/Parquet) or streaming API (Kafka/Kinesis), configurable per utility's existing meter data management (MDM) system.
- **FR-1.2:** Normalize to daily and monthly rollups per customer account; handle missing/estimated reads gracefully (flag as `estimated: true`).
- **FR-1.3:** Join usage data with account metadata (home size, heating type, rate plan) where available, to enable household-comparable analysis.
- **FR-1.4:** Support multi-premise customers (multiple meters per account).

### 7.2 Pattern & Anomaly Detection Engine (deterministic, non-LLM)
- **FR-2.1:** Compute period-over-period usage deltas (day/week/month/year).
- **FR-2.2:** Detect time-of-day peak shifts and identify likely driver categories (heating/cooling, baseload, unexplained spike) using statistical decomposition — not appliance-level disaggregation in v1 (that's a stretch goal via NILM in v2).
- **FR-2.3:** Compute anonymized neighbor/peer comparison (similar home size, similar climate zone) — percentile ranking only, never raw neighbor data exposed.
- **FR-2.4:** Flag statistically significant anomalies (>1.5 std dev from customer's own rolling baseline).
- **FR-2.5:** Output a structured JSON "signal package" per customer per cycle (see Section 9 for schema).

### 7.3 Orchestrator Agent (Agentic Core)
- **FR-3.1:** On a scheduled cadence (daily signal check, weekly digest, monthly report), the agent evaluates the signal package and decides whether a communication is warranted (avoid notification fatigue — max 1 proactive message per week per customer unless customer initiates chat).
- **FR-3.2:** Agent selects the appropriate tool(s) to call based on signal type (see tool list, Section 7.4).
- **FR-3.3:** Agent must ground every recommendation in the specific signal data — no generic/templated advice unless no specific signal exists (fallback general tip library allowed as last resort, clearly not personalized).
- **FR-3.4:** Agent supports conversational mode: customer can ask free-text questions ("why was my bill high in June?") via app chat; agent retrieves that customer's signal package + raw usage on demand and answers grounded in it.
- **FR-3.5:** Agent maintains short-term conversation memory within a session and long-term customer preference memory (channel preference, topics customer has dismissed, program enrollment status) across sessions.
- **FR-3.6:** All agent outputs must pass a **fact-check guard**: any numeric claim in the generated text is validated against the source signal JSON before sending; mismatches block delivery and log an error for review.

### 7.4 Sub-Tools (Agent-callable functions)

| Tool Name | Purpose | Input | Output |
|---|---|---|---|
| `get_usage_signals` | Fetch structured signal package for a customer/period | `account_id`, `period` | Signal JSON (Section 9) |
| `get_neighbor_comparison` | Anonymized percentile comparison | `account_id`, `period` | `{percentile, cohort_size, cohort_avg_kwh}` |
| `generate_recommendation` | Produce ranked list of tailored efficiency tips | `signal JSON` | List of `{tip, est_savings_kwh, est_savings_$, confidence}` |
| `match_programs` | Match customer to available utility programs (rebates, DR, time-of-use plans) | `account_id`, `usage_profile` | List of eligible programs |
| `get_customer_preferences` | Retrieve channel/topic preferences, consent status | `account_id` | Preferences object |
| `log_outcome` | Record whether customer viewed/acted on a recommendation | `account_id`, `rec_id`, `action` | ack |
| `escalate_to_human` | Hand off to CSR when agent confidence is low or customer requests a human | `account_id`, `conversation_transcript` | ticket_id |

### 7.5 Delivery & Channels
- **FR-5.1:** Support delivery via: in-app notification/dashboard card, email (HTML template), SMS (160-char summary + link).
- **FR-5.2:** Respect customer channel preference and quiet hours (no SMS/push between 9pm–8am local time).
- **FR-5.3:** Every message includes a clear unsubscribe/preference-adjustment link (regulatory requirement, e.g., CAN-SPAM/TCPA).
- **FR-5.4:** In-app conversational widget available on demand, not just triggered messages.

### 7.6 Feedback Loop
- **FR-6.1:** Track message opens, clicks, and — where measurable — subsequent usage change over the following billing cycle.
- **FR-6.2:** Feed outcome data back to adjust recommendation ranking/frequency per customer (e.g., stop suggesting a tip type the customer has dismissed twice).
- **FR-6.3:** Aggregate outcome data into a CX Head dashboard (engagement funnel, demand-reduction estimate, program conversion).

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Privacy** | Full compliance with applicable data privacy regulation (CCPA/CPRA if US customers, GDPR if applicable, plus sector-specific rules e.g. NAESB/state PUC data-sharing rules). Usage data is customer PII — treat as sensitive. |
| **Consent** | Explicit opt-in required before enrolling a customer in proactive AI messaging; opt-out must be immediate and honored within 24h. |
| **Data Minimization** | Agent/LLM calls must not include raw account identifiers (name, address, account number) in prompts sent to the LLM provider — use pseudonymous `account_id` only; PII resolved only at the delivery layer, post-generation. |
| **Data Retention** | Raw interval data retained per utility policy (typically 24 months); LLM conversation logs retained max 90 days unless customer consents to longer for personalization. |
| **Security** | Encryption in transit (TLS 1.2+) and at rest (AES-256) for all usage and account data. Role-based access control for internal dashboards. |
| **Auditability** | Every AI-generated message must be logged with the exact signal data used to generate it, for regulatory/dispute audit trail. |
| **Accuracy** | Fact-check guard (FR-3.6) is mandatory — zero tolerance for hallucinated usage figures. |
| **Availability** | 99.5% uptime for the agent service; ingestion pipeline must handle daily batch of up to [utility's customer count] accounts within nightly batch window. |
| **Scalability** | Architecture must scale horizontally; target initial rollout 100K–500K customers, designed to extend to full customer base. |
| **Explainability** | Every recommendation must include a one-line "why you're seeing this" grounded in data (builds trust, required for utility regulatory transparency in some states). |
| **Accessibility** | Customer-facing UI must meet WCAG 2.1 AA. |

---

## 9. Data Contracts / Schemas

### 9.1 Signal Package (output of Pattern & Anomaly Engine, input to Agent)
```json
{
  "account_id": "acct_9f2a...",
  "period": "2026-06",
  "usage_kwh": 812,
  "prior_period_kwh": 689,
  "pct_change": 17.9,
  "baseline_avg_kwh": 705,
  "anomaly_flag": true,
  "anomaly_zscore": 1.8,
  "likely_driver": "cooling_load_increase",
  "peak_hours": ["14:00-18:00"],
  "neighbor_percentile": 72,
  "cohort_avg_kwh": 640,
  "cohort_size": 148,
  "rate_plan": "standard_tiered",
  "estimated_reads": false,
  "home_profile": {
    "sq_ft_band": "1500-2000",
    "heating_type": "electric_heat_pump",
    "climate_zone": "4A"
  }
}
```

### 9.2 Recommendation Object
```json
{
  "rec_id": "rec_20260615_0007",
  "account_id": "acct_9f2a...",
  "tip": "Your usage spiked in the 2–6pm window, likely from AC running during peak heat. Try pre-cooling your home before 2pm to shift load off-peak.",
  "grounded_signal": "peak_hours + likely_driver",
  "est_savings_kwh_month": 24,
  "est_savings_usd_month": 4.10,
  "confidence": "high",
  "channel": "push",
  "created_at": "2026-06-15T09:00:00Z"
}
```

### 9.3 Customer Preferences Object
```json
{
  "account_id": "acct_9f2a...",
  "consent_status": "opted_in",
  "consent_date": "2026-05-01",
  "preferred_channel": "email",
  "quiet_hours": {"start": "21:00", "end": "08:00", "tz": "America/Chicago"},
  "dismissed_topics": ["ac_efficiency"],
  "enrolled_programs": ["time_of_use_pilot"]
}
```

---

## 10. Agent Prompt Design (for build reference)

**Orchestrator system prompt (summary — full version in `/prompts/orchestrator_system.md`):**
> You are an energy efficiency advisor for [Utility Name]. You only ever make claims backed by the provided signal JSON. You never fabricate usage numbers. Your tone is helpful, non-judgmental, and specific — avoid generic tips when a specific signal exists. If no significant signal exists, do not send a message this cycle. When answering customer questions, always call `get_usage_signals` first and ground your answer in the returned data. If asked something outside your scope (billing disputes, service outages, account changes), call `escalate_to_human`.

**Guardrails to implement:**
- Max output length per channel (SMS ≤160 chars, push ≤200 chars, email ≤400 words).
- Numeric fact-check pass (regex-extract numbers from generated text, cross-validate against signal JSON, block on mismatch).
- Profanity/PII leak filter before delivery.
- Rate limiter: max 1 proactive outbound message per customer per 7 days.

---

## 11. Technical Architecture & Stack Recommendation

| Layer | Recommendation |
|---|---|
| Usage data ingestion | Kafka or cloud-native equivalent (AWS Kinesis/GCP Pub-Sub), landing in a data lake (S3/GCS) |
| Data normalization / Anomaly engine | Python service (pandas/numpy or Spark for scale), deterministic — no LLM calls here |
| Orchestrator agent | LLM via Anthropic API (Claude), tool-calling architecture; hosted as a stateless service (FastAPI/Node) |
| Session/preference memory | Redis (short-term) + Postgres (long-term customer preferences/consent) |
| Delivery | Existing utility notification infra, or SendGrid (email), Twilio (SMS), Firebase/OneSignal (push) |
| Dashboards | Internal CX dashboard (React) + BI tool (Looker/Power BI) fed from outcome tracking DB |
| Observability | Full request/response logging for every LLM call (signal in, message out) for audit; latency & error monitoring (Datadog/Grafana) |
| Infra | Containerized (Docker/Kubernetes), CI/CD pipeline, staged environments (dev/staging/prod) |

---

## 12. Privacy & Compliance Plan (Primary Risk Mitigation)

Since **Privacy** is the flagged top risk, this section is mandatory reading before build:

1. **Opt-in consent flow** must be built and tested before any customer receives proactive messaging — no retroactive enrollment.
2. **PII isolation:** LLM prompts contain only pseudonymous account IDs and usage signals — never name, address, or account number. A separate "resolver" service maps `account_id` → contact info only at final delivery time, and that service has no LLM access.
3. **Third-party LLM data handling:** confirm data processing agreement with the LLM provider (Anthropic) specifies no training on customer data, and data residency requirements are met if applicable.
4. **Right to deletion/opt-out:** build an API endpoint + UI control that immediately halts future processing for a customer and purges conversation logs within the retention SLA.
5. **Regulatory review:** flag this project to the utility's legal/compliance and state PUC liaison before GA launch — many states have specific rules on customer energy data sharing (e.g., California's Rule 24/27).
6. **Anonymized cohort comparison:** neighbor comparison must never expose any individual neighbor's data — only aggregate percentile among a minimum cohort size (recommend minimum n=15 for k-anonymity).

---

## 13. Rollout Plan & Timeline (4–6 weeks, Low Complexity)

| Week | Milestone |
|---|---|
| Week 1 | Data ingestion pipeline + normalization service; confirm access to AMI/MDM data source; consent flow design & legal sign-off kickoff |
| Week 2 | Pattern & Anomaly engine built and validated against historical data (backtest against known high-bill complaints) |
| Week 3 | Orchestrator agent + tool integrations built; prompt guardrails + fact-check guard implemented; unit tests |
| Week 4 | Delivery channel integration (email/push/SMS); consent & preference UI; internal QA pass |
| Week 5 | Pilot launch to small opted-in cohort (~1,000–5,000 customers); monitor engagement, fact-check guard error rate, latency |
| Week 6 | Pilot review, tune recommendation ranking, fix issues, prep GA rollout plan + CX dashboard handoff |

**Post-launch (not in 6-week window):** phased GA rollout to full eligible customer base, ongoing model tuning based on outcome feedback loop.

---

## 13a. 1-Day MVP Build Plan

A production rollout cannot be compressed into a day — real AMI/MDM integration, legal/privacy sign-off, and a phased customer pilot are hard blockers that take real calendar time regardless of engineering speed. **What can be built in a day is a fully functional, demo-ready prototype** that proves the agentic architecture end-to-end using realistic synthetic data. This is the version to hand to a build agent (e.g., Antigravity) for a one-day sprint.

### What's IN scope for the 1-day build
- Synthetic usage dataset generator (realistic interval data for ~50–100 mock customer accounts, including a few engineered anomalies/spikes so the demo has something to detect).
- Pattern & Anomaly Engine (Section 7.2) — fully functional against the synthetic data.
- Orchestrator Agent + tool-calling (Section 7.3–7.4) — fully functional, using Claude via the Anthropic API.
- Fact-check guard (FR-3.6) — implemented and testable, since this is the core trust mechanism and is cheap to build.
- Conversational Q&A mode ("why was my bill high?") — working chat interface.
- One delivery channel only — in-app card/notification feed (skip email/SMS integration; those are just API calls to a provider, not core logic).
- Simple internal dashboard showing: signal detected → recommendation generated → mock engagement outcome.
- Consent/preference data model — schema and toggle UI present, but not wired to real legal opt-in flow.

### What's explicitly OUT of scope (deferred, not skipped)
- Live AMI/MDM data pipeline integration — replaced with the synthetic generator.
- Legal/compliance/privacy sign-off — Section 12 still must happen before any real customer data touches this system; flag to CX Head/Legal as a parallel, non-blocking track that does not gate the prototype build.
- Email/SMS provider integration (SendGrid/Twilio) — stub these as no-op/log-only in the prototype.
- Multi-tenant scaling, production observability stack, CI/CD hardening.
- Real neighbor-comparison k-anonymity enforcement — use mock cohort data, note the real requirement stays in Section 12.

### Hour-by-hour build sequence (single engineer/agent, ~8 hours)

| Time | Task |
|---|---|
| Hr 0–1 | Scaffold repo, set up Anthropic API access, define data schemas from Section 9 as code (types/models) |
| Hr 1–2 | Build synthetic usage data generator (50–100 accounts, interval data, 3–5 engineered anomalies) |
| Hr 2–3.5 | Build Pattern & Anomaly Engine (deterministic stats service) against synthetic data; unit test against known engineered anomalies |
| Hr 3.5–5.5 | Build Orchestrator Agent: system prompt, tool definitions (`get_usage_signals`, `generate_recommendation`, `get_neighbor_comparison`, `match_programs`), fact-check guard |
| Hr 5.5–6.5 | Build minimal front-end: customer view (recommendation feed + chat Q&A) and internal dashboard (signals → recs → outcomes) |
| Hr 6.5–7.5 | End-to-end test pass: run all 50–100 mock accounts through the pipeline, verify recommendations are grounded and fact-check guard catches injected bad data |
| Hr 7.5–8 | Polish, write a short README of what's mocked vs. production-ready, package for demo |

### Definition of Done for the 1-day build
- [ ] Running end-to-end demo: synthetic customer → anomaly detected → grounded recommendation generated → shown in UI.
- [ ] Chat Q&A answers a test question correctly using real signal data for at least 3 mock accounts.
- [ ] Fact-check guard demonstrably blocks at least one injected hallucination test case.
- [ ] README clearly documents every component that is mocked/stubbed vs. what's needed to make it production-real (this becomes the handoff doc for the 4–6 week production build in Section 13).

---

## 14. Acceptance Criteria (Definition of Done)

- [ ] Customer can opt in/out of AI-driven energy insights via app/web settings.
- [ ] Signal engine correctly computes usage deltas and anomalies validated against a labeled historical test set (>95% accuracy on known-anomaly cases).
- [ ] Agent generates at least one grounded, non-generic recommendation for 100% of accounts with a flagged anomaly signal in test data.
- [ ] Fact-check guard blocks 100% of test cases where injected numeric mismatches are present.
- [ ] Recommendations delivered via at least 2 channels (email + in-app) in pilot.
- [ ] Conversational Q&A correctly answers grounded test questions ("why was my usage high") using real signal data, with escalation fallback for out-of-scope queries.
- [ ] Full audit log exists for every message sent, tied to source signal data.
- [ ] Privacy/legal sign-off obtained before pilot launch.
- [ ] CX dashboard shows engagement rate, action rate, and estimated demand reduction for pilot cohort.
- [ ] No customer PII present in any LLM prompt/response log (verified via automated PII scanner on logs).

---

## 15. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Privacy/regulatory violation | Medium | High | Legal review, PII isolation architecture, consent-first design (Section 12) |
| LLM hallucinates usage figures | Medium | High | Deterministic anomaly engine + mandatory fact-check guard (FR-3.6) |
| Notification fatigue / opt-outs | Medium | Medium | Rate limiting (1 msg/week), preference controls, dismissal tracking |
| Poor data quality from AMI feed (missing/estimated reads) | Medium | Medium | Explicit `estimated_reads` flagging, graceful degradation of confidence |
| Low customer engagement | Medium | Medium | A/B test message tone/timing/channel during pilot before GA |
| Neighbor comparison re-identification risk | Low | High | Minimum cohort size (k-anonymity ≥15), percentile-only exposure |

---

## 16. Reference Model

This PRD is directly modeled on **Opower's** behavioral energy efficiency approach (Home Energy Reports, usage alerts, neighbor comparison — proven to drive 1.5–2.5% reduction per household historically at scale via static/rule-based methods). This project's hypothesis is that replacing static templated reports with an **agentic, conversational, dynamically-reasoning AI** increases personalization relevance and engagement enough to push blended demand reduction into the **10–15%** range for actively engaged customers, by combining Opower-style behavioral nudges with on-demand conversational explanation and tighter feedback-driven personalization.

---

## 17. Open Questions for Stakeholder Sign-off Before Build Starts

1. Which AMI/MDM system(s) will supply usage data, and what is the existing data access method (API, file drop, database replication)?
2. What is the exact customer base size for pilot vs. GA, and expected nightly batch volume?
3. Which regulatory jurisdictions apply (state PUC rules vary — determines consent and data-sharing constraints)?
4. Does the utility have an existing notification/CRM platform to integrate with, or should this project stand up its own?
5. Confirm LLM provider data processing agreement terms are acceptable to Legal/Compliance for this use case.

---

*End of PRD — ready for engineering/build-agent handoff.*
