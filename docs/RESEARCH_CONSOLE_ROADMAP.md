# Research Console — Product & Data Roadmap

Internal strategy doc for the Rainfall Hospital Directory (`rainfall-hospital-directory`). Maps **what we have**, **what to build**, and **why it helps selling TEAM / RAIN Compliant**.

---

## 1. Data we already have (build-time)

| Layer | Source | Fields / use |
|--------|--------|----------------|
| **Roster** | CMS TEAM participant list | 719 hospitals, state, CBSA, CCN, mandatory/voluntary |
| **CMS public** | Hospital General Info, cost report, HRRP, HACRP, HCAHPS, HVBP, MSPB | Stars, beds, discharges, FTE, penalties, domain scores |
| **Market** | Census ACS (county + CBSA) | Population, median income |
| **Rainfall tracker** | Master Tracker CSV | Region, CJR rank, outreach, pipeline, sales stage, est. TCV, top-50 flag |
| **Benchmarks** | `research-benchmarks.json` | National + per-state medians |
| **External** | Wikipedia / Wikidata (optional fetch) | Summary, founded, website, beds (often stale) |

**Not yet ingested (high value):** Medicare cost report revenue/margin, 990 (ProPublica), PECOS/NPI, Google/Leapfrog ratings, claims volume, EHR vendor.

---

## 2. What we shipped in UI (density + signal)

- **Profile:** compact hero + “At a glance”, colored metric tiles, hover explainers + **click insight drawer** (right panel), peer context strips, **HVBP stacked domain bar** + collapsible domain detail, **HRRP measure grid** (all conditions).
- **System / region / state pages:** rollup metric strip, **CJR rank + CMS stars distribution** charts (cohorts ≥3 hospitals), **pipeline funnel** (Funnel | Mix toggle with sales stage), state breakdown, dense hospital tables.
- **Home:** **collapsible cohort panel** (sessionStorage); CJR + stars distributions, **pipeline + sales-stage funnel tabs**, region breakdown — all **sync on filter** via `hospital-search:cohort-updated`; map, watchlist, keyboard shortcuts.
- **Regions / systems:** `RollupVsNationalStrip` + multi-state **context map** (`emphasisStates`, profile link mode).
- **Profile overview:** **Position in TEAM cohort** — national CJR/stars histograms with highlighted bin for this hospital.
- **State pages:** **vs national** median strip + compact **context map** (emphasized state, click → profile).
- **Compare:** table default + **radar chart** toggle for 2–3 hospitals (normalized axes).
- **Deferred (no data yet):** historical sparklines / trends, Chart.js/D3, TEAM revenue estimator, system-level `/compare?system=`.

---

## 3. High-priority builds (sales & pitch advantage)

### P0 — Next 2–4 weeks

| Feature | Insight / pitch | Data |
|---------|-----------------|------|
| **TEAM revenue estimator** | “$X–$Y upside over 5 years” by beds + discharges + MSPB tier | Roster + cost report + Rainfall pricing model (internal assumptions doc) |
| **State profile pages** `/states/CA` | ~~Choropleth + medians vs national~~ **Shipped:** `StateVsNationalStrip` + context `TeamStateMap` | `state-summaries.json` |
| **Account scorecard PDF / share link** | One-pager for CFO: stars, MSPB, HACRP, CJR, Rainfall stage | Profile + export |
| **“Why now” flags** | HACRP yes + low stars + no outreach = red account | Rules on directory index |
| **System comparison** `/compare?system=a,b` | Side-by-side rollups for IDN meetings | Rollups (exists for hospitals) |
| **Map → profile drill** | ~~Click state → top/bottom 5 by CJR in state~~ **Shipped:** map click filters roster; Alt+click state profile; top/bottom CJR strip when state filtered | Map + index |

### P1 — Differentiation

| Feature | Insight | Data |
|---------|---------|------|
| **Rainfall Readiness Index (RRI)** | Single 0–100: quality + efficiency + scale + pipeline warmth | Weighted composite (document weights) |
| **Peer cohort builder** | “Hospitals like you” = same state + bed band + ownership | Index facets |
| **Penalty exposure $** | HACRP 1% + readmission $ proxy from excess ratios | HACRP + HRRP |
| **Market stress score** | Low income + high MSPB + rural | ACS + MSPB |
| **Pipeline funnel viz** | ~~Conversion by stage~~ **Shipped** on rollups (Funnel | Mix) | Tracker |
| **Watchlist / bookmarks** | ~~localStorage~~ **Shipped** on home search (`rainfall-hospital-watchlist`); HubSpot sync still future | Client + optional CRM |

### P2 — Data moat

| Feature | Data to add |
|---------|-------------|
| Nonprofit 990 revenue & CEO | ProPublica API + EIN lookup |
| Full cost report financials | CMS HCRIS / cost report fields |
| EHR / cloud vendor | Rainfall research CSV or Definitive |
| Leapfrog / CMS deficiency history | Public files |
| Wikidata refresh CI | Scheduled `fetch:external-context` |

---

## 4. Visual / UX patterns to standardize

- **Green / amber / neutral** vs peer median (state on profile, national on rollups).
- **Horizontal bar** = percentile or share (CJR rank, mix charts, median position).
- **Hover ~300ms** = definition + takeaway (profile + rollup strips).
- **Click** = tab jump, filter URL, map→filter, metric **insight drawer** (profile).
- **Toggle** = Pipeline Funnel vs Mix, compare Table vs Chart, HVBP domain `<details>`.
- **Collapse** = Wikipedia, similar hospitals, long tables.

---

## 5. Calculators & indexes (Rainfall-specific)

1. **CJR rank** (live) — composite among 719 TEAM hospitals; use for prioritization narratives.
2. **TEAM financial impact range** — model episodes × mandated list × benchmark MSPB movement (needs assumptions table).
3. **Quality debt score** — count of measures below state median (stars, HCAHPS, HVBP, HRRP conditions, HACRP).
4. **Outreach coverage %** — by system/region (live in rollups).
5. **Rural access index** — % rural + HPSA (needs HRSA).
6. **System concentration** — % of system’s national beds on TEAM list.

---

## 6. Maps & geography

- Choropleth: count, stars, % rural, CJR, outreach (home — live).
- **CBSA/metro pages** — hospitals in metro + CBSA demographics.
- **State vs state** small multiples for BD planning.
- Export geoJSON for slides.

---

## 7. Compare & narrative tools

- Hospital compare (live) — row highlights + **radar chart** for 2–3 hospitals.
- **Narrative generator** (template): “{Hospital} ranks #{n} on Rainfall CJR, {stars} CMS stars ({vs state}), MSPB {x} ({vs national}), {HACRP/no penalty}, {outreach}.”
- **Battlecard per system** — auto from system rollup + wiki + top 5 hospitals.

---

## 8. Ops & trust

- Refresh SOP in `HOSPITAL_DATA_SOURCES.md`.
- “Data as of {date}” on every rollup strip.
- Confidence badges on Wikipedia matches.
- `noindex` + password on Netlify staging.

---

## 9. Suggested build order (if “everything” is the goal)

```mermaid
flowchart LR
  A[P0 State pages + flags] --> B[P0 Revenue estimator]
  B --> C[P1 RRI index]
  C --> D[P1 Peer cohorts]
  D --> E[P2 990 + HCRIS]
  E --> F[Insight drawer + PDF]
```

**Fastest win after this PR:** `/states/[st]` pages using existing `state-summaries.json` + same rollup UI as regions.

---

## 10. Open questions for Rainfall product

- Approved **$ figures** for TEAM upside (legal/compliance)?
- **HubSpot** sync: push CJR rank + flags to company records?
- **Editable** pipeline in UI vs CSV-only?
- National benchmark default on profiles: **state** vs **national** vs toggle?

---

## 11. Manual QA (charts + interactions)

- [ ] Home: cohort panel updates when filters change (distributions, funnel, regions)
- [ ] Home: map click filters list; Alt+click opens `/states/[ST]`; top/bottom CJR strip when state filtered
- [ ] Home: `/` focuses name search, `m` toggles list panel, Esc clears filters
- [ ] Home: watchlist ★ toggles; Watchlist preset filters; CSV exports filtered set
- [ ] `/states/CA`: vs-national strip + context map with state emphasized
- [ ] Profile overview: cohort position charts with ◆ on hospital’s bin
- [ ] Profile payment: HVBP stacked bar; quality: HRRP grid; metric tile click opens drawer
- [ ] Rollup: Pipeline Funnel | Mix toggle
- [ ] `/compare?h=a,b` (2–3 slugs): Table | Chart radar

*Last updated: 2026-05-30 (charts + interactions rollout). Complements `HOSPITAL_DATA_SOURCES.md` and `CLAUDE.md`.*
