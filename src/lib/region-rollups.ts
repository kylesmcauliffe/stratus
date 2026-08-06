import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import { systemSlugFromName } from '@/lib/hospital-directory-record';
import { directoryFilterOptions, directoryHospitals } from '@/lib/directory-index';
import { rollupHospitals, type SystemRollup } from '@/lib/system-rollups';

export function regionSlugFromName(name: string): string {
  return systemSlugFromName(name);
}

export function directoryRegions(): { name: string; slug: string; count: number }[] {
  return directoryFilterOptions.regions
    .map((name) => ({
      name,
      slug: regionSlugFromName(name),
      count: directoryHospitals.filter((h) => h.region === name).length,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getRegionBySlug(
  slug: string,
): { name: string; hospitals: DirectoryHospital[]; rollup: SystemRollup } | undefined {
  const match = directoryRegions().find((r) => r.slug === slug);
  if (!match) return undefined;
  const hospitals = directoryHospitals.filter((h) => h.region === match.name);
  return {
    name: match.name,
    hospitals,
    rollup: rollupHospitals(hospitals),
  };
}
