import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import { METRIC_EXPLAINERS, metricTakeaway } from '@/lib/metric-explainers';
import {
  compareToBenchmark,
  researchBenchmarks,
  stateBenchmarks,
  type CompareTone,
} from '@/lib/research-benchmarks';

const PEER_EXPLAINER_KEY: Partial<Record<PeerMetricKey, string>> = {
  cmsStars: 'CMS stars',
  mspb: 'MSPB',
  hvbp: 'HVBP score',
  hcahps: 'HCAHPS stars',
  hrrp: 'HRRP avg excess',
  cjr: 'TEAM rank (CJR)',
  beds: 'Licensed beds',
};

export type PeerMetricKey =
  | 'cmsStars'
  | 'mspb'
  | 'hvbp'
  | 'hcahps'
  | 'hrrp'
  | 'cjr'
  | 'beds';

export interface PeerChip {
  label: string;
  detail: string;
  tone: CompareTone;
  explainerTitle: string;
  explainerBody: string;
  takeaway: string;
}

export function buildPeerChips(
  record: DirectoryHospital | undefined,
  state: string,
  metrics: PeerMetricKey[],
): PeerChip[] {
  if (!record) return [];
  const stateBench = stateBenchmarks[state];
  const builders: Record<PeerMetricKey, () => ReturnType<typeof compareToBenchmark>> = {
    cmsStars: () =>
      compareToBenchmark({
        value: record.overallRating,
        benchmark: stateBench?.medianStars ?? researchBenchmarks.medianStars,
        metric: 'CMS stars',
        peerLabel: `${state} median`,
      }),
    mspb: () =>
      compareToBenchmark({
        value: record.mspbScore,
        benchmark: stateBench?.medianMspb ?? researchBenchmarks.medianMspb,
        lowerIsBetter: true,
        metric: 'MSPB',
        peerLabel: `${state} median`,
        format: (n) => n.toFixed(2),
      }),
    hvbp: () =>
      compareToBenchmark({
        value: record.hvbpTps,
        benchmark: stateBench?.medianHvbpTps ?? researchBenchmarks.medianHvbpTps,
        metric: 'HVBP TPS',
        peerLabel: `${state} median`,
        format: (n) => String(Math.round(n)),
      }),
    hcahps: () =>
      compareToBenchmark({
        value: record.hcahpsStar,
        benchmark: stateBench?.medianHcahpsStar ?? researchBenchmarks.medianHcahpsStar,
        metric: 'HCAHPS',
        peerLabel: `${state} median`,
      }),
    hrrp: () =>
      compareToBenchmark({
        value: record.hrrpAvgExcess,
        benchmark: researchBenchmarks.medianHrrpExcess,
        lowerIsBetter: true,
        metric: 'HRRP excess',
        peerLabel: 'national median',
        format: (n) => n.toFixed(3),
      }),
    cjr: () =>
      compareToBenchmark({
        value: record.teamRankByCjr,
        benchmark: stateBench?.medianTeamRankCjr ?? researchBenchmarks.medianTeamRankCjr,
        lowerIsBetter: true,
        metric: 'CJR rank',
        peerLabel: `${state} median`,
        format: (n) => `#${Math.round(n)}`,
      }),
    beds: () =>
      compareToBenchmark({
        value: record.beds,
        benchmark: stateBench?.medianBeds ?? researchBenchmarks.medianBeds,
        metric: 'Beds',
        peerLabel: `${state} median`,
        format: (n) => n.toLocaleString('en-US'),
      }),
  };

  return metrics
    .map((key) => {
      const compare = builders[key]();
      if (!compare) return null;
      const explainerKey = PEER_EXPLAINER_KEY[key] ?? compare.label;
      const explainer = METRIC_EXPLAINERS[explainerKey] ?? {
        title: compare.label,
        body: `Compared to ${state} and national TEAM cohort medians.`,
      };
      return {
        ...compare,
        explainerTitle: explainer.title,
        explainerBody: explainer.body,
        takeaway: metricTakeaway({
          tone: compare.tone,
          label: compare.label,
          peerDetail: compare.detail,
        }),
      };
    })
    .filter((c): c is PeerChip => c != null);
}
