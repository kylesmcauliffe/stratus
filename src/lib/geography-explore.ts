import type { RollupTableRow } from '@/components/directory/DirectoryRollupTable.astro';
import { directoryHospitals, directoryHealthSystems } from '@/lib/directory-index';
import {
  directoryFilterOwnershipBucketUrl,
  directoryFilterRuralUrl,
  stateProfilePath,
} from '@/lib/directory-links';
import { ownershipBucket } from '@/lib/metric-distribution';
import { directoryRegions } from '@/lib/region-rollups';
import { directoryStates } from '@/lib/state-rollups';
import { rollupHospitals } from '@/lib/system-rollups';

export type GeographySection = 'map' | 'states' | 'regions' | 'systems';

/** Unified States hub URL; optional hash scrolls to a section. */
export function geographyExplorePath(section?: GeographySection): string {
  if (!section) return '/states';
  return `/states#${section}`;
}

function rollupRow(
  name: string,
  href: string,
  hospitals: typeof directoryHospitals,
  count: number,
): RollupTableRow {
  const rollup = rollupHospitals(hospitals);
  const withPipeline = hospitals.filter((h) => h.pipelineStatus).length;
  return {
    name,
    href,
    count,
    medianCjr: rollup.medianTeamRankCjr,
    pctOutreach: rollup.pctOutreachYes,
    medianStars: rollup.medianStars,
    medianBeds: rollup.medianBeds,
    totalBeds: rollup.totalBeds,
    medianMspb: rollup.medianMspb,
    cjrTop50: rollup.cjrTop50Count,
    pctPipeline: hospitals.length ? Math.round((withPipeline / hospitals.length) * 100) : 0,
  };
}

export function buildStateExploreRows(): RollupTableRow[] {
  return directoryStates()
    .map(({ state, count }) =>
      rollupRow(
        state,
        stateProfilePath(state),
        directoryHospitals.filter((h) => h.state === state),
        count,
      ),
    )
    .sort((a, b) => b.count - a.count);
}

export function buildRegionExploreRows(): RollupTableRow[] {
  return directoryRegions()
    .map((r) =>
      rollupRow(
        r.name,
        `/regions/${r.slug}`,
        directoryHospitals.filter((h) => h.region === r.name),
        r.count,
      ),
    )
    .sort((a, b) => b.count - a.count);
}

export function buildSystemExploreRows(): RollupTableRow[] {
  return directoryHealthSystems()
    .map((s) =>
      rollupRow(
        s.name,
        `/systems/${s.slug}`,
        directoryHospitals.filter((h) => h.healthSystem === s.name),
        s.count,
      ),
    )
    .sort((a, b) => b.count - a.count);
}

const RURAL_URBAN_SEGMENTS: { label: string; match: (h: (typeof directoryHospitals)[0]) => boolean; href: string }[] = [
  {
    label: 'Urban',
    match: (h) => h.ruralUrban === 'U',
    href: directoryFilterRuralUrl('U'),
  },
  {
    label: 'Rural',
    match: (h) => h.ruralUrban === 'R',
    href: directoryFilterRuralUrl('R'),
  },
  {
    label: 'Unknown',
    match: (h) => h.ruralUrban !== 'R' && h.ruralUrban !== 'U',
    href: '/#search',
  },
];

const OWNERSHIP_SEGMENTS: {
  label: 'Non-profit' | 'Proprietary' | 'Gov' | 'Other' | 'Unknown';
  href: string;
}[] = [
  { label: 'Non-profit', href: directoryFilterOwnershipBucketUrl('Non-profit') },
  { label: 'Proprietary', href: directoryFilterOwnershipBucketUrl('Proprietary') },
  { label: 'Gov', href: directoryFilterOwnershipBucketUrl('Gov') },
  { label: 'Other', href: directoryFilterOwnershipBucketUrl('Other') },
  { label: 'Unknown', href: directoryFilterOwnershipBucketUrl('Unknown') },
];

export function buildRuralUrbanExploreRows(): RollupTableRow[] {
  return RURAL_URBAN_SEGMENTS.map((seg) => {
    const hospitals = directoryHospitals.filter(seg.match);
    return rollupRow(seg.label, seg.href, hospitals, hospitals.length);
  }).filter((r) => r.count > 0);
}

export function buildOwnershipExploreRows(): RollupTableRow[] {
  return OWNERSHIP_SEGMENTS.map((seg) => {
    const hospitals = directoryHospitals.filter(
      (h) => ownershipBucket(h.ownership) === seg.label,
    );
    return rollupRow(seg.label, seg.href, hospitals, hospitals.length);
  }).filter((r) => r.count > 0);
}
