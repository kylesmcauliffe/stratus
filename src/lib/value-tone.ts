import type { CompareTone } from '@/lib/research-benchmarks';

/** Yes/No and similar labels where Yes is favorable (outreach, top 50, etc.). */
export function yesNoTone(
  value: string | null | undefined,
  options?: { invert?: boolean },
): CompareTone | null {
  const v = (value ?? '').trim().toLowerCase();
  if (!v || v === '—' || v === '-') return null;
  if (v === 'yes' || v === 'true') return options?.invert ? 'warn' : 'good';
  if (v === 'no' || v === 'false') return options?.invert ? 'good' : 'warn';
  return null;
}

/** Penalty / Clear and other short status strings. */
export function statusLabelTone(value: string | null | undefined): CompareTone | null {
  const v = (value ?? '').trim().toLowerCase();
  if (v === 'penalty') return 'warn';
  if (v === 'clear') return 'good';
  return yesNoTone(value);
}

export function pickMetricTone(
  value: string,
  peerTone: CompareTone = 'neutral',
  override?: CompareTone,
): CompareTone {
  return override ?? statusLabelTone(value) ?? peerTone;
}

/** Extra emphasis on the primary value (green / red text). */
export function metricValueClass(
  value: string,
  options?: { invertYesNo?: boolean },
): string {
  const tone = options?.invertYesNo
    ? yesNoTone(value, { invert: true })
    : statusLabelTone(value);
  if (tone === 'good') return 'metric-value metric-value--positive';
  if (tone === 'warn') return 'metric-value metric-value--negative';
  return 'metric-value';
}
