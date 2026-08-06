/** Short hover context for geography cohort pie segments. */
export function pieSegmentHint(chartTitle: string, label: string): string {
  const key = `${chartTitle}::${label}`;
  const hints: Record<string, string> = {
    'Rural / urban::Urban': 'Hospitals in urban areas per CMS rural/urban designation.',
    'Rural / urban::Rural': 'Hospitals in rural areas per CMS rural/urban designation.',
    'Rural / urban::Unknown': 'Roster rows missing a rural/urban code.',
    'Ownership::Non-profit': 'Voluntary non-profit ownership (church, other, or private).',
    'Ownership::Proprietary': 'For-profit / proprietary ownership.',
    'Ownership::Gov': 'Federal, state, local, or hospital district ownership.',
    'Ownership::Other': 'Ownership types outside the main CMS buckets.',
    'Ownership::Unknown': 'Ownership not classified on the roster.',
    'CJR rank distribution::Top 50': 'National CJR rank 1–50 within the TEAM cohort.',
    'CJR rank distribution::51–150': 'CJR rank 51–150 — upper third of the cohort.',
    'CJR rank distribution::151–350': 'CJR rank 151–350 — middle of the cohort.',
    'CJR rank distribution::351+': 'CJR rank 351 and below — lower half of TEAM hospitals.',
    'CMS stars distribution::5★': 'CMS overall hospital star rating of 5.',
    'CMS stars distribution::4★': 'CMS overall star rating of 4.',
    'CMS stars distribution::3★': 'CMS overall star rating of 3.',
    'CMS stars distribution::1–2★': 'CMS overall star rating of 1 or 2.',
    'CMS stars distribution::Unrated': 'No CMS overall star rating on file.',
  };
  return hints[key] ?? `Hospitals in the ${label} segment of this cohort.`;
}
