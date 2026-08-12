# Stratus data sources

| File | Purpose |
|------|---------|
| `2026q1-team-participant-list.csv` | CMS TEAM roster (from `npm run fetch:team-roster`) |
| `team-participant-list.xlsx` | Raw CMS download |
| `rainfall-master-tracker.csv` | Rainfall Master Tracker export (replace bootstrap CSV with real internal export) |

## Rainfall Master Tracker

Drop your internal Master Tracker CSV here as `rainfall-master-tracker.csv`, then:

```bash
npm run import:rainfall-tracker
npm run build:directory-index
```

If the file is missing, `npm run prepare:tracker` synthesizes tracker fields from CMS metrics and writes a bootstrap CSV in this folder.

## Census county demographics

Set `CENSUS_API_KEY` in `.env` (free at https://api.census.gov/data/key_signup.html), then:

```bash
npm run fetch:county-demographics
npm run build:directory-index
```
