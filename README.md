# Stratus — Rainfall TEAM Battle Cards

Internal **mobile + web app** for Rainfall Health field teams — search CMS TEAM hospitals, swipe battle cards, save targets, log conference notes, compare hospitals, and ask an AI research assistant. Built with **Expo 57** + **Uniwind** (Tailwind v4), static web export to `dist/`, Netlify Functions for `/api/ask`.

**Not** the public marketing site at [rainfallhealth.com](https://www.rainfallhealth.com).

| Environment | URL | Deploy |
|-------------|-----|--------|
| Preview | [rainfall-aeo.netlify.app](https://rainfall-aeo.netlify.app) | `npm run build` → Netlify (`dist/`) |
| Local | Expo web (default port) | `npm run dev` |

Use **Netlify password protection** on preview — internal tool only.

---

## Quick start

```bash
git clone https://github.com/kylesmcauliffe/stratus.git
cd stratus
npm install
cp .env.example .env   # optional: CENSUS_API_KEY, EXPO_PUBLIC_ASK_API_URL
npm run dev
```

**Node:** `20+` recommended. Full CMS data (719 hospitals) ships in-repo; demo seeds only when index has &lt;50 hospitals.

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Expo web dev server |
| `npm run build` | Static web export → `dist/` |
| `npm run typecheck` | TypeScript check |
| `npm run refresh:data:live` | CMS roster + public profiles + tracker + county demographics + index |
| `npm run prepare:tracker` | Import real Master Tracker CSV or bootstrap from CMS metrics |
| `npm run export:tracker-csv` | Export tracker JSON → `data/sources/rainfall-master-tracker.csv` |

### Data refresh

```bash
npm run fetch:team-roster           # CMS TEAM XLSX → 719 hospitals
npm run fetch:public-data           # CMS quality/payment profiles
npm run prepare:tracker             # Master Tracker CSV → tracker JSON
npm run fetch:county-demographics   # ACS county pop/income (needs CENSUS_API_KEY)
npm run build:directory-index       # merge into directory index
```

Or one shot: `npm run refresh:data:live`

Drop your internal Rainfall export at `data/sources/rainfall-master-tracker.csv` before `prepare:tracker` to replace bootstrap data. See [`data/sources/README.md`](data/sources/README.md).

---

## App routes

| Tab / route | Purpose |
|-------------|---------|
| **Home** | Search, filters, mini map, hospital list |
| **Map** | State bubble map + filtered hospital list |
| **Deck** | Swipeable battle card stack |
| **Compare** | Pick 2–3 hospitals — table or radar chart |
| **Ask** | AI assistant (`/api/ask` on Netlify; local fallback offline) |
| **Saved** | Bookmarked hospitals + conference log link |
| `/hospital/[slug]` | Battle card, notes, PDF/share export |

---

## Project layout

```
app/                    # Expo Router screens
components/             # Battle cards, map, charts
lib/                    # Search, assistant, storage, export
netlify/functions/      # ask.ts (Netlify AI Gateway)
src/data/               # Generated hospital JSON + team-hospitals.ts
src/lib/                # Directory index, benchmarks, record builders
scripts/                # CMS fetch, tracker import, index build
data/sources/           # CMS CSV/XLSX, Master Tracker CSV
docs/                   # Data sources, legacy Astro notes
netlify.toml            # SPA + /api/* functions
```

Legacy Astro research console removed — see [`docs/LEGACY_ASTRO.md`](docs/LEGACY_ASTRO.md).

---

## Deploy (Netlify)

```bash
npm run build
```

- Publish directory: `dist/`
- Functions: `netlify/functions/` (`/api/ask` uses OpenAI via Netlify AI Gateway — enable AI on the site and deploy to production once)
- Set `CENSUS_API_KEY` in Netlify env for county demographics refresh in CI

---

## License

Proprietary. Code and content © Bettermeant Inc. d/b/a Rainfall Health.
