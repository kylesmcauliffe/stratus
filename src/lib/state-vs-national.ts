import type { StateSummary } from '@/lib/directory-index';
import {
  compareToBenchmark,
  researchBenchmarks,
  type CompareTone,
} from '@/lib/research-benchmarks';
import { METRIC_EXPLAINERS, metricTakeaway } from '@/lib/metric-explainers';
import { cjrBarPercent, scaleBarPercent, starsTone } from '@/lib/visual-indicators';

export type VsNationalCard = {
  id: string;
  label: string;
  stateValue: string;
  nationalValue: string;
  tone: CompareTone;
  barPercent: number | null;
  explainerTitle: string;
  explainerBody: string;
  takeaway: string;
};

function explainerFor(label: string): { title: string; body: string } {
  const hit = METRIC_EXPLAINERS[label];
  if (hit) return { title: hit.title, body: hit.body };
  return { title: label, body: 'Compared to the national TEAM cohort median.' };
}

export function withMetricExplainer(
  partial: Omit<VsNationalCard, 'explainerTitle' | 'explainerBody' | 'takeaway'>,
): VsNationalCard {
  const ex = explainerFor(partial.label);
  return {
    ...partial,
    explainerTitle: ex.title,
    explainerBody: ex.body,
    takeaway: metricTakeaway({
      tone: partial.tone,
      label: partial.label,
      peerDetail: `Nat. ${partial.nationalValue}`,
    }),
  };
}

/** @deprecated Use VsNationalCard */
export interface StateVsNationalCard extends VsNationalCard {}

export function buildStateVsNationalCards(summary: StateSummary): VsNationalCard[] {
  const nat = researchBenchmarks;

  const hvbpCmp = compareToBenchmark({
    value: summary.medianHvbpTps,
    benchmark: nat.medianHvbpTps,
    metric: 'HVBP',
    peerLabel: 'national median',
    format: (n) => String(Math.round(n)),
  });
  const hcahpsCmp = compareToBenchmark({
    value: summary.medianHcahpsStar,
    benchmark: nat.medianHcahpsStar,
    metric: 'HCAHPS',
    peerLabel: 'national median',
  });

  const outreachTone: CompareTone =
    (summary.pctOutreachYes ?? 0) > (nat.pctOutreachYes ?? 0)
      ? 'good'
      : (summary.pctOutreachYes ?? 0) < (nat.pctOutreachYes ?? 0) - 5
        ? 'warn'
        : 'neutral';

  return [
    withMetricExplainer({
      id: 'stars',
      label: 'Median CMS ★',
      stateValue: summary.medianStars != null ? `${summary.medianStars} / 5` : '—',
      nationalValue: nat.medianStars != null ? `${nat.medianStars}` : '—',
      tone: starsTone(summary.medianStars ?? null, nat.medianStars),
      barPercent: scaleBarPercent(summary.medianStars, 1, 5),
    }),
    withMetricExplainer({
      id: 'cjr',
      label: 'Median CJR',
      stateValue:
        summary.medianTeamRankCjr != null ? `#${Math.round(summary.medianTeamRankCjr)}` : '—',
      nationalValue:
        nat.medianTeamRankCjr != null ? `#${Math.round(nat.medianTeamRankCjr)}` : '—',
      tone:
        summary.medianTeamRankCjr != null && nat.medianTeamRankCjr != null
          ? summary.medianTeamRankCjr < nat.medianTeamRankCjr
            ? 'good'
            : summary.medianTeamRankCjr > nat.medianTeamRankCjr
              ? 'warn'
              : 'neutral'
          : 'neutral',
      barPercent: cjrBarPercent(summary.medianTeamRankCjr ?? null),
    }),
    withMetricExplainer({
      id: 'mspb',
      label: 'Median MSPB',
      stateValue: summary.medianMspb != null ? summary.medianMspb.toFixed(2) : '—',
      nationalValue: nat.medianMspb != null ? nat.medianMspb.toFixed(2) : '—',
      tone:
        summary.medianMspb != null && nat.medianMspb != null
          ? summary.medianMspb < nat.medianMspb
            ? 'good'
            : summary.medianMspb > nat.medianMspb
              ? 'warn'
              : 'neutral'
          : 'neutral',
      barPercent: scaleBarPercent(summary.medianMspb ?? null, 0.9, 1.2, true),
    }),
    withMetricExplainer({
      id: 'hvbp',
      label: 'Median HVBP',
      stateValue:
        summary.medianHvbpTps != null ? String(Math.round(summary.medianHvbpTps)) : '—',
      nationalValue: nat.medianHvbpTps != null ? String(Math.round(nat.medianHvbpTps)) : '—',
      tone: hvbpCmp?.tone ?? 'neutral',
      barPercent: scaleBarPercent(summary.medianHvbpTps ?? null, 0, 100),
    }),
    withMetricExplainer({
      id: 'hcahps',
      label: 'Median HCAHPS',
      stateValue:
        summary.medianHcahpsStar != null ? `${summary.medianHcahpsStar} / 5` : '—',
      nationalValue: nat.medianHcahpsStar != null ? `${nat.medianHcahpsStar}` : '—',
      tone: hcahpsCmp?.tone ?? 'neutral',
      barPercent: scaleBarPercent(summary.medianHcahpsStar ?? null, 1, 5),
    }),
    withMetricExplainer({
      id: 'outreach',
      label: '% outreach yes',
      stateValue: `${summary.pctOutreachYes ?? 0}%`,
      nationalValue: `${nat.pctOutreachYes ?? 0}%`,
      tone: outreachTone,
      barPercent: scaleBarPercent(summary.pctOutreachYes ?? 0, 0, 100),
    }),
    withMetricExplainer({
      id: 'rural',
      label: '% rural',
      stateValue: `${summary.pctRural}%`,
      nationalValue: '—',
      tone: 'neutral',
      barPercent: scaleBarPercent(summary.pctRural, 0, 100),
    }),
    withMetricExplainer({
      id: 'count',
      label: 'Hospitals',
      stateValue: String(summary.count),
      nationalValue: '719',
      tone: 'neutral',
      barPercent: scaleBarPercent(summary.count, 1, 120),
    }),
  ];
}
