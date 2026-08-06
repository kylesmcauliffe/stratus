import type { SystemRollup } from '@/lib/system-rollups';
import {
  compareToBenchmark,
  researchBenchmarks,
  type CompareTone,
} from '@/lib/research-benchmarks';
import { withMetricExplainer, type VsNationalCard } from '@/lib/state-vs-national';
import { cjrBarPercent, scaleBarPercent, starsTone } from '@/lib/visual-indicators';

export function buildRollupVsNationalCards(rollup: SystemRollup): VsNationalCard[] {
  const nat = researchBenchmarks;

  const hvbpCmp = compareToBenchmark({
    value: rollup.medianHvbpTps,
    benchmark: nat.medianHvbpTps,
    metric: 'HVBP',
    peerLabel: 'national median',
    format: (n) => String(Math.round(n)),
  });
  const hcahpsCmp = compareToBenchmark({
    value: rollup.medianHcahpsStar,
    benchmark: nat.medianHcahpsStar,
    metric: 'HCAHPS',
    peerLabel: 'national median',
  });

  const outreachTone: CompareTone =
    rollup.pctOutreachYes > (nat.pctOutreachYes ?? 0)
      ? 'good'
      : rollup.pctOutreachYes < (nat.pctOutreachYes ?? 0) - 5
        ? 'warn'
        : 'neutral';

  return [
    withMetricExplainer({
      id: 'stars',
      label: 'Median CMS ★',
      stateValue: rollup.medianStars != null ? `${rollup.medianStars} / 5` : '—',
      nationalValue: nat.medianStars != null ? `${nat.medianStars}` : '—',
      tone: starsTone(rollup.medianStars, nat.medianStars),
      barPercent: scaleBarPercent(rollup.medianStars, 1, 5),
    }),
    withMetricExplainer({
      id: 'cjr',
      label: 'Median CJR',
      stateValue:
        rollup.medianTeamRankCjr != null ? `#${Math.round(rollup.medianTeamRankCjr)}` : '—',
      nationalValue:
        nat.medianTeamRankCjr != null ? `#${Math.round(nat.medianTeamRankCjr)}` : '—',
      tone:
        rollup.medianTeamRankCjr != null && nat.medianTeamRankCjr != null
          ? rollup.medianTeamRankCjr < nat.medianTeamRankCjr
            ? 'good'
            : rollup.medianTeamRankCjr > nat.medianTeamRankCjr
              ? 'warn'
              : 'neutral'
          : 'neutral',
      barPercent: cjrBarPercent(rollup.medianTeamRankCjr),
    }),
    withMetricExplainer({
      id: 'mspb',
      label: 'Median MSPB',
      stateValue: rollup.medianMspb != null ? rollup.medianMspb.toFixed(2) : '—',
      nationalValue: nat.medianMspb != null ? nat.medianMspb.toFixed(2) : '—',
      tone:
        rollup.medianMspb != null && nat.medianMspb != null
          ? rollup.medianMspb < nat.medianMspb
            ? 'good'
            : rollup.medianMspb > nat.medianMspb
              ? 'warn'
              : 'neutral'
          : 'neutral',
      barPercent: scaleBarPercent(rollup.medianMspb, 0.9, 1.2, true),
    }),
    withMetricExplainer({
      id: 'hvbp',
      label: 'Median HVBP',
      stateValue: rollup.medianHvbpTps != null ? String(Math.round(rollup.medianHvbpTps)) : '—',
      nationalValue: nat.medianHvbpTps != null ? String(Math.round(nat.medianHvbpTps)) : '—',
      tone: hvbpCmp?.tone ?? 'neutral',
      barPercent: scaleBarPercent(rollup.medianHvbpTps, 0, 100),
    }),
    withMetricExplainer({
      id: 'hcahps',
      label: 'Median HCAHPS',
      stateValue:
        rollup.medianHcahpsStar != null ? `${rollup.medianHcahpsStar} / 5` : '—',
      nationalValue: nat.medianHcahpsStar != null ? `${nat.medianHcahpsStar}` : '—',
      tone: hcahpsCmp?.tone ?? 'neutral',
      barPercent: scaleBarPercent(rollup.medianHcahpsStar, 1, 5),
    }),
    withMetricExplainer({
      id: 'outreach',
      label: '% outreach yes',
      stateValue: `${rollup.pctOutreachYes}%`,
      nationalValue: `${nat.pctOutreachYes ?? 0}%`,
      tone: outreachTone,
      barPercent: scaleBarPercent(rollup.pctOutreachYes, 0, 100),
    }),
    withMetricExplainer({
      id: 'states',
      label: 'States',
      stateValue: String(rollup.states.length),
      nationalValue: '—',
      tone: 'neutral',
      barPercent: scaleBarPercent(rollup.states.length, 1, 50),
    }),
    withMetricExplainer({
      id: 'count',
      label: 'Hospitals',
      stateValue: String(rollup.hospitalCount),
      nationalValue: '719',
      tone: 'neutral',
      barPercent: scaleBarPercent(rollup.hospitalCount, 1, 120),
    }),
  ];
}
