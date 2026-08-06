/**
 * Rainfall-internal notes per hospital (slug-keyed).
 * Populate when you have a CSV or spreadsheet; empty until then.
 */
export interface HospitalRainfallResearch {
  rainStatus?: string;
  ehr?: string;
  revenueNotes?: string;
  accountOwner?: string;
  lastResearched?: string;
}

/** Add entries like: 'abbeville-general-hospital-la': { ehr: 'Epic', ... } */
export const rainfallResearchBySlug: Record<string, HospitalRainfallResearch> = {};

export function getRainfallResearch(slug: string): HospitalRainfallResearch | undefined {
  const entry = rainfallResearchBySlug[slug];
  if (!entry || Object.keys(entry).length === 0) return undefined;
  return entry;
}
