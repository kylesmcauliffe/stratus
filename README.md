# Rainfall CMS TEAM Hospital Directory

Internal **research console** for Rainfall Health — search, map, compare, and profile all CMS TEAM mandated hospitals (~719). Built with **Astro 6** + **Tailwind CSS v4**, fully static (`dist/`).

**Not** the public marketing site at [rainfallhealth.com](https://www.rainfallhealth.com). Legacy marketing URLs in this repo redirect to `/` via `netlify.toml`.

| Environment | URL | Deploy |
|-------------|-----|--------|
| Preview | [rainfall-aeo.netlify.app](https://rainfall-aeo.netlify.app) | Manual: build locally, drag `dist/` to [Netlify Drop](https://app.netlify.com/drop) |
| Local | `http://localhost:4321` | `npm run dev` |

Use **Netlify password protection** on preview — the site sets `noindex` and `robots.txt` disallows crawlers, but that is not a substitute for access control.

---

## Quick start

```bash
git clone https://github.com/Bettermeant-Health/rainfall-hospital-directory.git
cd rainfall-hospital-directory
npm install
npm run dev
```

**Node:** `22.x` recommended (`netlify.toml`). Newer Node (e.g. 26) often works locally if `npm run build` succeeds.

Copy `.env.example` → `.env` only when refreshing Census demographics (`CENSUS_API_KEY`) or overriding `SITE` for builds.

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server at :4321 |
| `npm run check` | Astro type/diagnostics |
| `npm run build` | `astro check` + static build → `dist/` |
| `npm run build:staging` | Build with `SITE=https://rainfall-aeo.netlify.app` |
| `npm run build:drop` | Staging build + security audit |
| `npm run preview` | Serve `dist/` locally |
| `npm run validate` | Prettier check + `astro check` |
| `npm run audit:security` | Verify `dist/_headers` + production `npm audit` |

There is **no test runner** — `npm run check` (also run inside `npm run build`) is the gate.

### Data refresh (optional)

After updating `data/sources/2026q1-team-participant-list.csv` or tracker exports:

```bash
npm run sync:team-roster      # team-hospitals.ts from CMS CSV
npm run import:rainfall-tracker
npm run fetch:public-data     # CMS PDC profiles by CCN
npm run fetch:county-demographics   # needs CENSUS_API_KEY in .env
npm run fetch:cbsa-demographics
npm run build:directory-index
npm run fetch:external-context      # Wikipedia/Wikidata snapshots (per slug)
```

Or: `npm run refresh:data` (roster + tracker + CMS + demographics + index).

See [`docs/HOSPITAL_DATA_SOURCES.md`](docs/HOSPITAL_DATA_SOURCES.md) for APIs, join keys, and URL filter params.

---

## What’s in the app

| Route | Purpose |
|-------|---------|
| `/` | National search, map, cohort panel, watchlist, filters |
| `/hospitals/[slug]` | Hospital profile (hero metrics, tabs, cohort position, bio) |
| `/states`, `/states/[ST]` | State rollups + vs national |
| `/systems`, `/systems/[slug]` | Health system rollups |
| `/regions`, `/regions/[slug]` | Master Tracker regions |
| `/compare?h=slug1,slug2` | Side-by-side (up to 3 hospitals) |

---

## Project layout

```
src/
├── pages/              # index, hospitals, states, systems, regions, compare
├── components/
│   ├── CmsHospitalSearch.astro
│   ├── TeamStateMap.astro
│   └── directory/      # rollups, cohort charts, profile UI
├── data/
│   ├── team-hospitals.ts
│   ├── hospital-directory-index.json
│   ├── hospital-public-profiles.json
│   └── …               # demographics, tracker, Wikipedia snapshots
├── lib/                # search, rollups, benchmarks, explainers
└── layouts/DirectoryLayout.astro

docs/
├── HOSPITAL_DATA_SOURCES.md
└── RESEARCH_CONSOLE_ROADMAP.md

scripts/                # roster sync, CMS fetch, index build, audits
netlify.toml            # Node 22, publish dist/, legacy 301s → /
```

Agent-oriented architecture notes: [`CLAUDE.md`](CLAUDE.md).

---

## Deploy preview (Netlify Drop)

```bash
npm run build:staging
npm run audit:security
```

Drag the **`dist/`** folder onto [Netlify Drop](https://app.netlify.com/drop). Git push does **not** update preview unless the Netlify site is linked to this repo.

`netlify.toml` publish directory: `dist/`. Do not commit `dist/` (gitignored).

---

## Save to GitHub

```bash
git add -A
git status
git commit -m "Expand TEAM research console with profiles, rollups, and data tooling."
git push origin main
```

Run `npm run validate` before pushing if you want an extra check.

---

## Troubleshooting

- **`nvm: command not found`** — Skip `nvm`; use Node 22+ if builds pass.
- **`zsh: command not found: #`** — Do not paste comment lines (`# …`) into the terminal.
- **`no changes added to commit`** — Run `git add -A` before `git commit`.
- **`audit:security` fails on xlsx** — High finding is dev-only (`enrich-team-hospitals`); production deps are clean. Re-run `npm run audit:security` after latest `security-verify.mjs`.
- **Build ~900+ pages** — Expected (every hospital profile is prerendered).

---

## License

Proprietary. Code and content © Bettermeant Inc. d/b/a Rainfall Health.
