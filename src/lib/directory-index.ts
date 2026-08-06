import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import { systemSlugFromName } from '@/lib/hospital-directory-record';
import indexData from '@/data/hospital-directory-index.json';
import stateData from '@/data/state-summaries.json';

export interface DirectoryIndexFile {
  generatedAt: string;
  hospitals: DirectoryHospital[];
  filterOptions: {
    ownership: string[];
    healthSystems: string[];
    regions: string[];
    pipelineStatuses: string[];
    salesStages: string[];
    outreachStatuses: string[];
  };
}

export interface StateSummary {
  state: string;
  count: number;
  medianStars: number | null;
  pctRural: number;
  totalBeds: number;
  medianBeds: number | null;
  withPublicDataCount: number;
  ownershipBreakdown: { label: string; count: number }[];
  medianMspb?: number | null;
  medianHvbpTps?: number | null;
  medianHcahpsStar?: number | null;
  medianTeamRankCjr?: number | null;
  pctOutreachYes?: number;
}

const index = indexData as DirectoryIndexFile;
const summaries = stateData as { generatedAt: string; byState: Record<string, StateSummary> };

export const directoryHospitals = index.hospitals;
export const directoryFilterOptions = index.filterOptions;
export const directoryIndexGeneratedAt = index.generatedAt;
export const stateSummariesByState = summaries.byState;

const bySlug = new Map(directoryHospitals.map((h) => [h.slug, h]));

export function getDirectoryHospital(slug: string): DirectoryHospital | undefined {
  return bySlug.get(slug);
}

export function getStateSummary(state: string): StateSummary | undefined {
  return stateSummariesByState[state];
}

/** Unique health systems with at least one hospital. */
export function directoryHealthSystems(): { name: string; slug: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const h of directoryHospitals) {
    if (!h.healthSystem) continue;
    counts.set(h.healthSystem, (counts.get(h.healthSystem) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      slug: systemSlugFromName(name),
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getHealthSystemBySlug(slug: string): { name: string; hospitals: DirectoryHospital[] } | undefined {
  const systems = directoryHealthSystems();
  const match = systems.find((s) => s.slug === slug);
  if (!match) return undefined;
  return {
    name: match.name,
    hospitals: directoryHospitals.filter((h) => h.healthSystem === match.name),
  };
}
