import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import { directoryHospitals } from '@/lib/directory-index';

function byCjr(a: DirectoryHospital, b: DirectoryHospital): number {
  const ar = a.teamRankByCjr ?? 9999;
  const br = b.teamRankByCjr ?? 9999;
  if (ar !== br) return ar - br;
  return a.name.localeCompare(b.name);
}

/** Nearby CJR ranks in the same state (excludes current hospital). */
export function statePeerLeague(
  state: string,
  currentSlug: string,
  limit = 12,
): DirectoryHospital[] {
  return directoryHospitals
    .filter((h) => h.state === state && h.slug !== currentSlug)
    .sort(byCjr)
    .slice(0, limit);
}

/** TEAM hospitals in the same health system (excludes current). */
export function systemPeerLeague(
  systemName: string,
  currentSlug: string,
  limit = 12,
): DirectoryHospital[] {
  const key = systemName.trim().toLowerCase();
  return directoryHospitals
    .filter(
      (h) => h.healthSystem?.trim().toLowerCase() === key && h.slug !== currentSlug,
    )
    .sort(byCjr)
    .slice(0, limit);
}
