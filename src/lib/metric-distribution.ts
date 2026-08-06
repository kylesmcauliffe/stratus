import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import { TEAM_MANDATED_HOSPITAL_COUNT } from '@/data/team-hospitals';

export interface DistributionBin {
  label: string;
  count: number;
  pct: number;
}

export interface MetricDistribution {
  title: string;
  bins: DistributionBin[];
  median: number | null;
  total: number;
}

function buildBins(
  labels: string[],
  counts: number[],
  total: number,
): DistributionBin[] {
  return labels.map((label, i) => ({
    label,
    count: counts[i] ?? 0,
    pct: total ? Math.round(((counts[i] ?? 0) / total) * 100) : 0,
  }));
}

export function cjrRankDistribution(hospitals: DirectoryHospital[]): MetricDistribution {
  const ranks = hospitals.map((h) => h.teamRankByCjr).filter((n): n is number => n != null);
  const total = ranks.length;
  const labels = ['Top 50', '51–150', '151–350', '351+'];
  const counts = [0, 0, 0, 0];
  for (const r of ranks) {
    if (r <= 50) counts[0]++;
    else if (r <= 150) counts[1]++;
    else if (r <= 350) counts[2]++;
    else counts[3]++;
  }
  const sorted = [...ranks].sort((a, b) => a - b);
  const median =
    sorted.length === 0
      ? null
      : sorted.length % 2
        ? sorted[Math.floor(sorted.length / 2)]!
        : (sorted[sorted.length / 2 - 1]! + sorted[sorted.length / 2]!) / 2;
  return {
    title: 'CJR rank distribution',
    bins: buildBins(labels, counts, total),
    median,
    total,
  };
}

export function starsDistribution(hospitals: DirectoryHospital[]): MetricDistribution {
  const stars = hospitals.map((h) => h.overallRating).filter((n): n is number => n != null);
  const total = hospitals.length;
  const labels = ['5★', '4★', '3★', '1–2★', 'Unrated'];
  const counts = [0, 0, 0, 0, 0];
  for (const h of hospitals) {
    const s = h.overallRating;
    if (s == null) counts[4]++;
    else if (s >= 4.5) counts[0]++;
    else if (s >= 3.5) counts[1]++;
    else if (s >= 2.5) counts[2]++;
    else counts[3]++;
  }
  const sorted = [...stars].sort((a, b) => a - b);
  const median =
    sorted.length === 0
      ? null
      : sorted.length % 2
        ? sorted[Math.floor(sorted.length / 2)]!
        : (sorted[sorted.length / 2 - 1]! + sorted[sorted.length / 2]!) / 2;
  return {
    title: 'CMS stars distribution',
    bins: buildBins(labels, counts, total),
    median,
    total,
  };
}

export function formatCjrMedian(rank: number | null): string {
  if (rank == null) return '—';
  const pct = Math.round(((TEAM_MANDATED_HOSPITAL_COUNT - rank + 1) / TEAM_MANDATED_HOSPITAL_COUNT) * 100);
  return `#${Math.round(rank)} (top ${pct}%)`;
}

export function formatStarsMedian(stars: number | null): string {
  if (stars == null) return '—';
  return `${stars}★`;
}

const CJR_BIN_LABELS = ['Top 50', '51–150', '151–350', '351+'] as const;
const STARS_BIN_LABELS = ['5★', '4★', '3★', '1–2★', 'Unrated'] as const;

export function cjrBinLabelForRank(rank: number): string {
  if (rank <= 50) return CJR_BIN_LABELS[0];
  if (rank <= 150) return CJR_BIN_LABELS[1];
  if (rank <= 350) return CJR_BIN_LABELS[2];
  return CJR_BIN_LABELS[3];
}

export function starsBinLabelForRating(rating: number | null | undefined): string {
  if (rating == null) return STARS_BIN_LABELS[4];
  if (rating >= 4.5) return STARS_BIN_LABELS[0];
  if (rating >= 3.5) return STARS_BIN_LABELS[1];
  if (rating >= 2.5) return STARS_BIN_LABELS[2];
  return STARS_BIN_LABELS[3];
}

export function medianLabelForDistribution(dist: MetricDistribution): string {
  if (dist.title.includes('CJR')) return formatCjrMedian(dist.median);
  if (dist.title.includes('stars')) return formatStarsMedian(dist.median);
  return dist.median != null ? String(dist.median) : '—';
}

export function ruralUrbanDistribution(hospitals: DirectoryHospital[]): MetricDistribution {
  let rural = 0;
  let urban = 0;
  let unknown = 0;
  for (const h of hospitals) {
    if (h.ruralUrban === 'R') rural++;
    else if (h.ruralUrban === 'U') urban++;
    else unknown++;
  }
  const total = hospitals.length;
  const labels = ['Urban', 'Rural', 'Unknown'];
  const counts = [urban, rural, unknown];
  return {
    title: 'Rural / urban',
    bins: buildBins(labels, counts, total),
    median: null,
    total,
  };
}

export function ownershipBucket(ownership: string | undefined): string {
  if (!ownership) return 'Unknown';
  if (ownership.includes('Voluntary non-profit')) return 'Non-profit';
  if (ownership === 'Proprietary') return 'Proprietary';
  if (ownership.includes('Government')) return 'Gov';
  return 'Other';
}

export function ownershipDistribution(hospitals: DirectoryHospital[]): MetricDistribution {
  const order = ['Non-profit', 'Proprietary', 'Gov', 'Other', 'Unknown'];
  const counts = new Map(order.map((l) => [l, 0]));
  for (const h of hospitals) {
    const bucket = ownershipBucket(h.ownership);
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }
  const total = hospitals.length;
  const labels = order.filter((l) => (counts.get(l) ?? 0) > 0);
  return {
    title: 'Ownership',
    bins: buildBins(
      labels,
      labels.map((l) => counts.get(l) ?? 0),
      total,
    ),
    median: null,
    total,
  };
}
