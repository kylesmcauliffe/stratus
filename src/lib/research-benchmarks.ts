import benchmarksJson from '@/data/research-benchmarks.json';
import type { StateSummary } from '@/lib/directory-index';

export interface NationalBenchmarks {
  medianStars: number | null;
  medianBeds: number | null;
  medianMspb: number | null;
  medianHvbpTps: number | null;
  medianHcahpsStar: number | null;
  medianHrrpExcess: number | null;
  medianTeamRankCjr: number | null;
  pctHacrpPenalty: number;
  pctOutreachYes: number;
}

export interface BenchmarkFile {
  generatedAt: string;
  national: NationalBenchmarks;
  byState: Record<string, StateSummary>;
}

const data = benchmarksJson as BenchmarkFile;

export const researchBenchmarks = data.national;
export const stateBenchmarks = data.byState;

export type CompareTone = 'good' | 'warn' | 'neutral';

export function compareToBenchmark(input: {
  value: number | null | undefined;
  benchmark: number | null | undefined;
  /** When true, lower values are better (MSPB, HRRP excess, CJR rank). */
  lowerIsBetter?: boolean;
  /** Short metric name, e.g. "CMS stars". */
  metric: string;
  /** Peer group, e.g. "CA median" or "national median". */
  peerLabel: string;
  format?: (n: number) => string;
}): { label: string; detail: string; tone: CompareTone } | null {
  const { value, benchmark, lowerIsBetter = false, metric, peerLabel } = input;
  if (value == null || benchmark == null) return null;
  const fmt = input.format ?? ((n) => String(Math.round(n * 100) / 100));
  const diff = value - benchmark;
  const pct = benchmark !== 0 ? Math.round((diff / benchmark) * 100) : 0;
  let tone: CompareTone = 'neutral';
  if (Math.abs(diff) > 0.001) {
    const better = lowerIsBetter ? diff < 0 : diff > 0;
    tone = better ? 'good' : 'warn';
  }
  const dir = diff > 0 ? 'above' : diff < 0 ? 'below' : 'at';
  const dirPhrase = dir === 'at' ? 'At' : dir === 'above' ? 'Above' : 'Below';
  const pctSuffix = dir !== 'at' && pct !== 0 ? ` · ${Math.abs(pct)}%` : '';
  return {
    label: metric,
    detail: `${fmt(value)} — ${dirPhrase} ${peerLabel} (${fmt(benchmark)})${pctSuffix}`,
    tone,
  };
}
