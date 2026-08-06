import type { CompareTone } from '@/lib/research-benchmarks';

export const TONE_SURFACE: Record<CompareTone, string> = {
  good: 'ind-tone ind-tone--good',
  warn: 'ind-tone ind-tone--warn',
  neutral: 'ind-tone ind-tone--neutral',
};

export const ROSTER_SIZE = 719;

/** 0–100 fill for horizontal bar (higher = better CJR rank). */
export function cjrBarPercent(rank: number | null, total = ROSTER_SIZE): number | null {
  if (rank == null || rank < 1) return null;
  return Math.round(((total - rank + 1) / total) * 100);
}

export function scaleBarPercent(
  value: number | null,
  min: number,
  max: number,
  invert = false,
): number | null {
  if (value == null || max <= min) return null;
  const t = (value - min) / (max - min);
  const pct = Math.round((invert ? 1 - t : t) * 100);
  return Math.max(4, Math.min(100, pct));
}

export function starsTone(
  stars: number | null,
  benchmark: number | null,
): CompareTone {
  if (stars == null || benchmark == null) return 'neutral';
  if (stars > benchmark) return 'good';
  if (stars < benchmark) return 'warn';
  return 'neutral';
}

export function cjrTone(rank: number | null, benchmark: number | null): CompareTone {
  if (rank == null || benchmark == null) return 'neutral';
  if (rank < benchmark) return 'good';
  if (rank > benchmark) return 'warn';
  return 'neutral';
}

export function mspbTone(score: number | null, benchmark: number | null): CompareTone {
  if (score == null || benchmark == null) return 'neutral';
  if (score < benchmark) return 'good';
  if (score > benchmark) return 'warn';
  return 'neutral';
}

export function outreachTone(pct: number, benchmarkPct: number): CompareTone {
  if (pct > benchmarkPct) return 'good';
  if (pct < benchmarkPct - 5) return 'warn';
  return 'neutral';
}
