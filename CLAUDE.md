# CLAUDE.md

This file provides guidance when working in this repository.

## Project

**Internal CMS TEAM hospital directory** for Rainfall Health research. Static Astro 6 + Tailwind CSS v4 site deployed to Netlify (`rainfall-aeo.netlify.app`). Not the public marketing site at rainfallhealth.com.

- Home (`/`): **NationalCohortPanel** (collapsible; map + CJR/stars tabs; stacked pipeline + sales stage; region bars + snapshot; `hospital-search:cohort-updated`), filters, watchlist, keyboard `/` `m` `Esc`
- Regions (`/regions/[slug]`) / systems (`/systems/[slug]`): **RollupVsNationalStrip**, rollup cards, **TeamStateMap** with `emphasisStates`
- Profiles (`/hospitals/[slug]`): overview **ProfileCohortPosition** (national histogram markers), tabbed brief, HVBP/HRRP viz, insight drawer
- State profiles (`/states/[ST]`): **StateVsNationalStrip**, rollup distributions, context **TeamStateMap** (`linkMode="profile"`, `emphasisState`)
- Compare (`/compare?h=slug1,slug2,slug3`) — up to 3 hospitals; table + optional radar chart toggle
- Health systems (`/systems`, `/systems/[slug]`) — rollups + filter link
- Regions (`/regions`, `/regions/[slug]`) — Master Tracker region rollups
- `noindex` + `robots.txt` disallow — use Netlify password protection for internal access

## Commands

```bash
npm run dev       # http://localhost:4321
npm run build     # astro check + static build → dist/
npm run check     # Type/diagnostics only
npm run build:staging   # SITE=https://rainfall-aeo.netlify.app
```

Node 22 (`netlify.toml`). No test runner — `npm run check` is the gate.

## Architecture

### Data

[`src/data/team-hospitals.ts`](src/data/team-hospitals.ts) — 741 mandated hospitals. Slugs via [`src/lib/hospital-slug.ts`](src/lib/hospital-slug.ts). Data refresh pipeline:

```bash
# After placing/updating data/sources/2026q1-team-participant-list.csv:
npm run sync:team-roster   # regenerate team-hospitals.ts from CMS CSV
npm run refresh:data       # sync roster + CMS + Census + directory index
```

- [`hospital-public-profiles.json`](src/data/hospital-public-profiles.json) — CMS general info, cost report, HRRP, HACRP, HCAHPS, HVBP, MSPB (by CCN)
- [`county-demographics.json`](src/data/county-demographics.json) — Census ACS county population/income (`CENSUS_API_KEY` required)
- [`hospital-directory-index.json`](src/data/hospital-directory-index.json) + [`state-summaries.json`](src/data/state-summaries.json) + [`research-benchmarks.json`](src/data/research-benchmarks.json)
- [`hospital-rainfall-tracker.json`](src/data/hospital-rainfall-tracker.json) — Master Tracker by CCN (`npm run import:rainfall-tracker`)

Helpers: [`src/lib/directory-index.ts`](src/lib/directory-index.ts), [`src/lib/system-rollups.ts`](src/lib/system-rollups.ts), [`src/lib/region-rollups.ts`](src/lib/region-rollups.ts), [`src/lib/cms-links.ts`](src/lib/cms-links.ts), [`src/lib/peer-context-chips.ts`](src/lib/peer-context-chips.ts). More sources: [`docs/HOSPITAL_DATA_SOURCES.md`](docs/HOSPITAL_DATA_SOURCES.md) (includes ops bookmarks).

### Layouts

[`DirectoryLayout.astro`](src/layouts/DirectoryLayout.astro) — only layout in use. Minimal header/footer, SEO with `noindex`.

### Page index

[`src/data/page-index.ts`](src/data/page-index.ts) — home + hospital profiles for OG/llms breadcrumbs. Hospital profiles use shared OG image `/og/hospitals/profile.png` (not 741 separate PNGs).

### Build-time routes

- [`src/pages/og/[...slug].png.ts`](src/pages/og/[...slug].png.ts) — satori + resvg (home + shared profile OG only)
- [`src/pages/llms.txt.ts`](src/pages/llms.txt.ts) — slim directory index
- [`src/pages/robots.txt.ts`](src/pages/robots.txt.ts) — `Disallow: /`

### Search & research console

[`src/lib/hospital-search.ts`](src/lib/hospital-search.ts) + [`CmsHospitalSearch.astro`](src/components/CmsHospitalSearch.astro) embed `hospital-directory-index.json`. URL params documented in [`docs/HOSPITAL_DATA_SOURCES.md`](docs/HOSPITAL_DATA_SOURCES.md). Quick-filter presets and sort (`sort=cjr`, etc.). Map choropleth includes median CJR, % outreach, median MSPB. Map/list sync via `dispatchHospitalSearchState` / `hospital-search:matched`. Watchlist: [`src/lib/watchlist.ts`](src/lib/watchlist.ts).

**Viz (SVG/CSS):** [`NationalCohortPanel.astro`](src/components/directory/NationalCohortPanel.astro), [`cohort-metric-tabs.ts`](src/lib/cohort-metric-tabs.ts), [`RollupVsNationalStrip.astro`](src/components/directory/RollupVsNationalStrip.astro), [`StateVsNationalStrip.astro`](src/components/directory/StateVsNationalStrip.astro); [`TeamStateMap`](src/components/TeamStateMap.astro) supports `emphasisState` / `emphasisStates` / `linkMode`.

Roadmap: [`docs/RESEARCH_CONSOLE_ROADMAP.md`](docs/RESEARCH_CONSOLE_ROADMAP.md).

### Icons

`astro-icon` + Phosphor (`<Icon name="ph:arrow-left" />`).

Path alias: `@/*` → `src/*`.

### Styling

Brand tokens in [`src/styles/global.css`](src/styles/global.css) (`bg-brand-blue`, `rounded-[var(--radius-card)]`, etc.).

## Redirects

[`netlify.toml`](netlify.toml) — legacy marketing paths (`/cms-team/*`, `/about/*`, etc.) 301 to `/`.
