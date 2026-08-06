import type { SystemRollup } from '@/lib/system-rollups';
import {
  compareToBenchmark,
  researchBenchmarks,
  type CompareTone,
} from '@/lib/research-benchmarks';
import { cjrBarPercent, cjrTone, mspbTone, outreachTone, scaleBarPercent, starsTone } from '@/lib/visual-indicators';
import { METRIC_EXPLAINERS, metricTakeaway } from '@/lib/metric-explainers';

export interface RollupMetricCard {
  id: string;
  label: string;
  value: string;
  sub: string | null;
  tone: CompareTone;
  barPercent: number | null;
  explainerTitle: string;
  explainerBody: string;
  takeaway: string;
}

export function buildRollupMetricCards(
  rollup: SystemRollup,
  peerLabel = 'national TEAM median',
): RollupMetricCard[] {
  const nat = researchBenchmarks;

  const starsCmp = compareToBenchmark({
    value: rollup.medianStars,
    benchmark: nat.medianStars,
    metric: 'CMS stars',
    peerLabel,
  });
  const cjrCmp = compareToBenchmark({
    value: rollup.medianTeamRankCjr,
    benchmark: nat.medianTeamRankCjr,
    lowerIsBetter: true,
    metric: 'CJR rank',
    peerLabel,
    format: (n) => `#${Math.round(n)}`,
  });
  const mspbCmp = compareToBenchmark({
    value: rollup.medianMspb,
    benchmark: nat.medianMspb,
    lowerIsBetter: true,
    metric: 'MSPB',
    peerLabel,
    format: (n) => n.toFixed(2),
  });

  const cards: RollupMetricCard[] = [
    {
      id: 'count',
      label: 'Hospitals',
      value: String(rollup.hospitalCount),
      sub: rollup.states.length ? rollup.states.join(', ') : null,
      tone: 'neutral',
      barPercent: scaleBarPercent(rollup.hospitalCount, 1, 150),
      explainerTitle: 'Roster count',
      explainerBody: 'CMS TEAM mandated hospitals in this group on the 2026 participant list.',
      takeaway: `${rollup.hospitalCount} facilities in this view.`,
    },
    {
      id: 'beds',
      label: 'Total beds',
      value: rollup.totalBeds ? rollup.totalBeds.toLocaleString('en-US') : '—',
      sub: rollup.medianBeds != null ? `median ${rollup.medianBeds.toLocaleString('en-US')}` : null,
      tone: 'neutral',
      barPercent: scaleBarPercent(rollup.totalBeds, 0, 50000),
      explainerTitle: 'Licensed beds',
      explainerBody: 'Sum of CMS cost report beds across hospitals in the group.',
      takeaway: 'Scale proxy for aggregate footprint.',
    },
    {
      id: 'stars',
      label: 'Median CMS ★',
      value: rollup.medianStars != null ? `${rollup.medianStars} / 5` : '—',
      sub: starsCmp?.detail ?? null,
      tone: starsTone(rollup.medianStars, nat.medianStars),
      barPercent: scaleBarPercent(rollup.medianStars, 1, 5),
      explainerTitle: METRIC_EXPLAINERS['CMS stars']?.title ?? 'CMS stars',
      explainerBody: METRIC_EXPLAINERS['CMS stars']?.body ?? '',
      takeaway: metricTakeaway({ tone: starsCmp?.tone, label: 'Median CMS stars', peerDetail: starsCmp?.detail ?? null }),
    },
    {
      id: 'cjr',
      label: 'Median CJR',
      value: rollup.medianTeamRankCjr != null ? `#${Math.round(rollup.medianTeamRankCjr)}` : '—',
      sub: cjrCmp?.detail ?? null,
      tone: cjrTone(rollup.medianTeamRankCjr, nat.medianTeamRankCjr),
      barPercent: cjrBarPercent(rollup.medianTeamRankCjr != null ? Math.round(rollup.medianTeamRankCjr) : null),
      explainerTitle: 'Rainfall CJR rank (median)',
      explainerBody:
        'Median of internal composite ranks among hospitals in this group. Lower rank = stronger composite quality vs all 719 TEAM hospitals.',
      takeaway: metricTakeaway({ tone: cjrCmp?.tone, label: 'Median CJR', peerDetail: cjrCmp?.detail ?? null }),
    },
    {
      id: 'outreach',
      label: 'Outreach yes',
      value: `${rollup.pctOutreachYes}%`,
      sub: `${rollup.pctOutreachYes}% vs ${nat.pctOutreachYes}% national`,
      tone: outreachTone(rollup.pctOutreachYes, nat.pctOutreachYes),
      barPercent: rollup.pctOutreachYes,
      explainerTitle: 'Outreach (Master Tracker)',
      explainerBody: 'Share of hospitals with outreach status Yes in the Rainfall Master Tracker.',
      takeaway: `Pipeline coverage: ${rollup.pctOutreachYes}% of group has active outreach.`,
    },
    {
      id: 'top50',
      label: 'CJR top 50',
      value: String(rollup.cjrTop50Count),
      sub:
        rollup.hospitalCount > 0
          ? `${Math.round((rollup.cjrTop50Count / rollup.hospitalCount) * 100)}% of group`
          : null,
      tone: rollup.cjrTop50Count >= 2 ? 'good' : rollup.cjrTop50Count === 0 ? 'neutral' : 'neutral',
      barPercent: scaleBarPercent(rollup.cjrTop50Count, 0, rollup.hospitalCount || 1),
      explainerTitle: 'CJR top-50 flag count',
      explainerBody: 'Hospitals flagged in the Master Tracker as top-50 composite among TEAM participants.',
      takeaway: `${rollup.cjrTop50Count} hospitals in elite composite tier.`,
    },
    {
      id: 'tcv',
      label: 'Est. TCV Σ',
      value: rollup.totalEstTcv
        ? `$${(rollup.totalEstTcv / 1_000_000).toFixed(1)}M`
        : '—',
      sub: rollup.totalEstTcv
        ? `$${rollup.totalEstTcv.toLocaleString('en-US', { maximumFractionDigits: 0 })} total`
        : null,
      tone: 'neutral',
      barPercent: null,
      explainerTitle: 'Estimated total contract value',
      explainerBody: 'Sum of Rainfall est. TCV fields from the Master Tracker (internal planning, not CMS).',
      takeaway: 'Revenue opportunity envelope for the group (internal estimate).',
    },
    {
      id: 'mspb',
      label: 'Median MSPB',
      value: rollup.medianMspb != null ? rollup.medianMspb.toFixed(2) : '—',
      sub: mspbCmp?.detail ?? null,
      tone: mspbTone(rollup.medianMspb, nat.medianMspb),
      barPercent: scaleBarPercent(rollup.medianMspb, 0.85, 1.15, true),
      explainerTitle: METRIC_EXPLAINERS['MSPB index']?.title ?? 'MSPB',
      explainerBody: METRIC_EXPLAINERS['MSPB index']?.body ?? '',
      takeaway: metricTakeaway({ tone: mspbCmp?.tone, label: 'Median MSPB', peerDetail: mspbCmp?.detail ?? null }),
    },
  ];

  return cards;
}
