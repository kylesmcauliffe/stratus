import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import { directoryFilterOptions } from '@/lib/directory-index';
import { rollupHospitals } from '@/lib/system-rollups';

export interface RegionBreakdownRow {
  region: string;
  count: number;
  medianCjr: number | null;
  pctOutreach: number;
}

export function regionBreakdownFromHospitals(hospitals: DirectoryHospital[]): RegionBreakdownRow[] {
  const regions = directoryFilterOptions.regions;
  const rows: RegionBreakdownRow[] = [];
  for (const region of regions) {
    const cohort = hospitals.filter((h) => h.region === region);
    if (!cohort.length) continue;
    const rollup = rollupHospitals(cohort);
    rows.push({
      region,
      count: rollup.hospitalCount,
      medianCjr: rollup.medianTeamRankCjr,
      pctOutreach: rollup.pctOutreachYes,
    });
  }
  return rows.sort((a, b) => b.count - a.count);
}
