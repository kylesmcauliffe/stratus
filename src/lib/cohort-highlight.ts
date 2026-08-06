import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import { TEAM_MANDATED_HOSPITAL_COUNT } from '@/data/team-hospitals';
import { cjrBinLabelForRank, starsBinLabelForRating } from '@/lib/metric-distribution';

export function cohortMarkersForHospital(record: DirectoryHospital | undefined): {
  cjrBin: string | null;
  starsBin: string | null;
  cjrNote: string | null;
} {
  if (!record) {
    return { cjrBin: null, starsBin: null, cjrNote: null };
  }
  const rank = record.teamRankByCjr;
  const cjrBin = rank != null ? cjrBinLabelForRank(rank) : null;
  const starsBin = starsBinLabelForRating(record.overallRating);
  const cjrNote =
    rank != null
      ? `This hospital · #${rank} of ${TEAM_MANDATED_HOSPITAL_COUNT}`
      : null;
  return { cjrBin, starsBin, cjrNote };
}
