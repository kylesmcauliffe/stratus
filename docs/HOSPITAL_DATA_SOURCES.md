# Hospital research data — sources and join strategy

Internal directory users already know TEAM. Profiles should read like **research briefs** (location, scale, finances, leadership, market), not program explainers.

## Join key (start here)

| Key | Source | Notes |
|-----|--------|--------|
| **CCN** (6-digit CMS Certification Number) | [TEAM participant XLSX](https://www.cms.gov/team-model-participant-list) | Already in CMS roster; add to `team-hospitals.ts` via `npm run enrich:hospitals` |
| **NPI** (organization) | [NPPES NPI Registry](https://npiregistry.cms.hhs.gov/) API | Search by hospital name + state; validate against CCN where possible |
| **Slug** | This repo | Stable profile URL; not a federal identifier |

## Tier 1 — Free, bulk, build-time friendly (recommended first)

### CMS Provider Data Catalog / data.cms.gov

- **API:** `https://data.cms.gov/data-api/v1` (no key; paginate/filter by CCN)
- **Catalog:** `https://data.cms.gov/data.json`
- **Hospital topic:** [data.cms.gov/provider-data/topics/hospitals](https://data.cms.gov/provider-data/topics/hospitals) — 70+ datasets

Useful for briefs:

| Dataset theme | Example fields |
|---------------|----------------|
| Hospital general information | Address, phone, type, ownership, emergency services |
| Timely & effective care | Process measures |
| Complications / deaths | Outcome measures |
| HCAHPS | Patient experience |
| Payment / value of care | Medicare spending, episode payments |
| Unplanned readmissions | Quality signal |
| Overall star rating | Summary quality |

**Build pattern:** Script downloads or queries by CCN list → `src/data/hospital-cms-enrichment.json` keyed by slug or CCN → profiles render at build time.

### Medicare cost reports (financial scale)

- **HCRIS / cost report** — hospital revenue, expenses, beds (reported annually). Available via CMS research files (large; not a simple REST API). Good for “how big” and margin proxies.
- **CMS Open Payments** — physician/hospital payments from industry (transparency).

### CMS care compare / PDC CSV bulk download

- Download full hospital CSV from Provider Data Catalog, join on `Facility ID` / CCN in build script.

## Tier 2 — Enrichment APIs (per hospital or batched)

| Source | What you get | Access |
|--------|----------------|--------|
| **Wikipedia / Wikidata** | History, founding, bed count (often outdated), coordinates | Wikidata SPARQL or Wikipedia API by name; fuzzy match risky |
| **OpenStreetMap / Nominatim** | Lat/lon, address geocode | Free; rate limits |
| **Census ACS** (via CBSA/county FIPS) | Population, income, age, insurance — **who the hospital serves** | data.census.gov; join metro/county from CBSA |
| **HRSA / Data.HRSA.gov** | Rural, HPSA, uninsured | County/CBSA joins |
| **ProPublica Nonprofit Explorer** | 990 revenue, executives (nonprofit hospitals) | API by EIN; need EIN lookup |
| **SEC EDGAR** | Public parent company financials (for-profit chains) | By ticker/parent |
| **LinkedIn / social** | No official API for scraping; manual research only | Not automatable at scale without ToS risk |

## Tier 3 — Commercial / licensed (later)

- **Definitive Healthcare**, **Clarivate**, **Dun & Bradstreet** — beds, staff, executives, claims volume, system affiliation (authoritative; paid).
- **Google Places** — hours, photos, ratings (not clinical; Places API costs).

## Rainfall-internal (your CSV when ready)

`src/data/hospital-rainfall-research.ts` (or gitignored CSV → build script):

- RAIN / compliance status
- EHR (Epic, Cerner, …)
- Revenue opportunity notes
- Account owner, last researched date
- Call notes

## Suggested profile sections (no fluff)

1. **Identity** — CCN, roster name, address (CMS), metro (CBSA), inferred system
2. **Scale** — beds, FTEs, discharges (cost report or commercial)
3. **Market** — CBSA population, median income, rural/urban flags (Census + HRSA)
4. **Quality snapshot** — star rating, key HCAHPS (CMS, one row)
5. **Finance** — net patient revenue, operating margin (990 or cost report)
6. **Leadership** — CEO / C-suite (990, LinkedIn manual, or commercial)
7. **Rainfall** — internal research fields only

## Implemented in this repo (`npm run fetch:public-data`)

| Dataset | URL | Fields used on profiles |
|---------|-----|-------------------------|
| **Hospital General Information** | `xubh-q36u` | Address, county, ownership, CMS stars, readmission/safety measure counts |
| **Hospital Provider Cost Report 2023** | CMS cost report CSV | Beds, discharges, FTE, Medicare CBSA, rural/urban |
| **HRRP FY2026** | `9n3s-kdb3` | Condition-level excess readmission ratios (AMI, HF, PN, COPD, THA/TKA, CABG) |
| **HACRP FY2026** | `yq43-i98g` | Total HAC score, PSI-90, **payment reduction (1%)** |
| **HCAHPS – Hospital** | `dgck-syfz` | Summary star rating, survey volume, response rate |
| **HVBP – Total Performance Score** | `ypbt-wvdk` | TPS + four domain weighted scores |
| **Medicare Spending per Beneficiary** | `rrqw-56er` | MSPB-1 index (1.0 = national average) |

Stored in [`src/data/hospital-public-profiles.json`](../src/data/hospital-public-profiles.json), joined on **CCN**.

## Research console data pipeline

```bash
npm run sync:team-roster              # data/sources/2026q1-team-participant-list.csv → team-hospitals.ts
npm run import:rainfall-tracker       # data/sources/rainfall-master-tracker.csv → tracker JSON
npm run enrich:hospitals
npm run fetch:public-data
npm run fetch:county-demographics   # needs CENSUS_API_KEY in .env
npm run fetch:cbsa-demographics     # same key, metro-level ACS
npm run build:directory-index
# shorthand: npm run refresh:data  (includes sync:team-roster + import:rainfall-tracker)
```

| Artifact | Script | Used for |
|----------|--------|----------|
| `hospital-directory-index.json` | `build:directory-index` | Home search, CSV export, compare page |
| `state-summaries.json` | `build:directory-index` | State summary bar, map choropleth |
| `county-demographics.json` | `fetch:county-demographics` | Profile “Market context” (ACS 5-year: `B01003_001E`, `B19013_001E`) |

### Census ACS county demographics

- **API:** `https://api.census.gov/data/2022/acs/acs5` — **requires** `CENSUS_API_KEY` ([signup](https://api.census.gov/data/key_signup.html))
- County match key: `ST|COUNTY` (normalized name, strips “ County” / “ Parish”)
- Script: [`scripts/fetch-county-demographics.mjs`](../scripts/fetch-county-demographics.mjs)

### Home URL search params

| Param | Meaning |
|-------|---------|
| `q` | Facility name tokens |
| `state` | Two-letter state |
| `stars` | Minimum CMS stars (e.g. `3`) |
| `beds` | `<100`, `100-299`, or `300+` |
| `rural` | `R` or `U` |
| `ownership` | CMS ownership string |
| `system` | Health system name (exact match from roster inference) |
| `region` | Rainfall Master Tracker region |
| `outreach` | Outreach status (e.g. `Yes`) |
| `pipeline` | Pipeline status |
| `stage` | Sales stage |
| `cjrTop50` | `1` = CJR top-50 flag only |
| `maxCjr` | Max TEAM rank by CJR (e.g. `50`) |
| `hasPipeline` | `1` = has any pipeline status |
| `sort` | `cjr`, `stars`, `beds`, `mspb`, `tcv`, `name`, `relevance` |

Profile tabs use hash URLs: `/hospitals/{slug}#rainfall`, `#quality`, etc.

## Operations (team bookmarks)

| Bookmark | URL |
|----------|-----|
| Outreach + top CJR | `/?outreach=Yes&maxCjr=50&sort=cjr` |
| California by CJR | `/?state=CA&sort=cjr` |
| Active pipeline | `/?hasPipeline=1` |
| CJR top-50 flag | `/?cjrTop50=1` |

**Tracker-only update:** `npm run import:rainfall-tracker && npm run build:directory-index`

**Deploy:** `npm run build:staging` → Netlify (`rainfall-aeo.netlify.app`). Use site password protection.

**Routes:** `/systems`, `/regions`, `/compare?h=slug1,slug2`

## Wikipedia + Wikidata (public background)

```bash
npm run fetch:external-context              # all systems + hospitals (~4–8 min with rate limit)
npm run fetch:external-context -- --systems-only
npm run fetch:external-context -- --hospitals-only
npm run fetch:external-context -- --hospitals-only --state CT   # one state (~2–5 min)
npm run fetch:external-context -- --limit 50
npm run fetch:external-context -- --slug midstate-medical-center-ct
WIKI_DELAY_MS=1200 npm run fetch:external-context -- --hospitals-only  # full roster (~15–25 min)
```

Uses the public **Wikipedia REST summary** and **Wikidata** APIs (same endpoints from Node, R, or Python). You do not need R Studio — the bottleneck is Wikipedia rate limits (HTTP 429), not missing API access. Re-run after fetch, then `npm run build` (or restart dev) so JSON is picked up.

| Artifact | Used on |
|----------|---------|
| `hospital-external-context.json` | Profile **Overview** → “Public background” (hospital article, else parent system) |
| `system-external-context.json` | `/systems/[slug]` header context |

Fields: intro summary (Wikipedia), founded year / age (Wikidata P571), official website (P856), beds/employees when present (P6801 / P1128). Match confidence is shown when weak. **Not** a substitute for CMS quality data — Care Compare links remain on profiles.

Curated system search queries: [`scripts/data/system-wiki-queries.json`](../scripts/data/system-wiki-queries.json).

## Next public sources to add

1. **CMS Hospital Enrollments (PECOS)** — NPI, legal name, practice address.
2. **ProPublica Nonprofit Explorer** — 990 revenue & officers (nonprofits only).
3. **Rainfall CSV** — internal research fields.

## Profile features

- Tabbed brief: Overview, Quality, Payment, Market, Rainfall (internal), TEAM
- Similar hospitals: same system first, then same-state peers by CJR proximity
- Medicare Care Compare + CMS dataset links (by CCN)
- Peer context vs state/national medians on Overview, Payment, and Market tabs
