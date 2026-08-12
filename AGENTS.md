# AGENTS.md — Stratus (Rainfall TEAM Battle Cards)

**Stratus** is Rainfall Health’s **internal Expo app** for CMS TEAM hospital intelligence — battle cards, search, saved lists, and conference notes for sales and field teams. Web + iOS + Android from one codebase.

## Tech stack

- **Expo** `~57` + **Expo Router** (`app/`)
- **React Native** / **React Native Web** (static export → `dist/`)
- **Uniwind** + Tailwind v4 (`global.css`, `metro.config.js`)
- **Fonts:** DM Sans (`@expo-google-fonts/dm-sans`)
- **Storage:** `@react-native-async-storage/async-storage` (watchlist, notes, conference log)
- **Data:** `src/data/*.json` + `scripts/` pipeline (CMS roster, tracker, directory index)

Path alias: `@/*` → project root; `@/src/lib/*`, `@/data/*` for legacy data modules.

## Folder map

| Area | Path |
|------|------|
| Routes | `app/(tabs)/`, `app/hospital/[slug].tsx` |
| UI | `components/` |
| App logic | `lib/` (battle-card, search, storage) |
| Data accessors | `src/lib/` (directory index, benchmarks) |
| Generated data | `src/data/` |
| Data scripts | `scripts/` |
| Legacy Astro (deprecated) | `src/pages/`, `src/components/directory/` |

## Routes

| Tab / screen | Path |
|--------------|------|
| Home (search) | `/` |
| Battle deck (swipe) | `/deck` |
| Saved cards | `/saved` |
| Conference log | `/log` |
| Hospital battle card | `/hospital/[slug]` |

## Commands

| Command | Action |
|--------|--------|
| `npm run seed:demo` | Demo hospital JSON (21 hospitals) |
| `npm run dev` | Expo web |
| `npm run build` | Static web export → `dist/` |
| `npm run typecheck` | TypeScript |
| `npm run refresh:data` | Full CMS + tracker pipeline (needs source CSVs) |

## Guardrails

- Internal tool only — keep `noindex` / Netlify password on deploy.
- Prefer minimal diffs; reuse `src/lib` data layer and `lib/battle-card.ts`.
- Replace demo data with `npm run refresh:data` when source CSVs are available.
