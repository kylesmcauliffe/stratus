import type { TeamHospital } from '@/data/team-hospitals';
import type { HospitalPublicProfile } from '@/data/hospital-public-profile';
import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import { TEAM_MANDATED_HOSPITAL_COUNT } from '@/data/team-hospitals';
import {
  compareToBenchmark,
  researchBenchmarks,
  stateBenchmarks,
  type CompareTone,
} from '@/lib/research-benchmarks';
import { METRIC_EXPLAINERS, metricTakeaway, teamRankTakeaway } from '@/lib/metric-explainers';
import type { ProfileMetricsSummary } from '@/lib/profile-metric-tiles';
import { buildProfileMetricTiles } from '@/lib/profile-metric-tiles';
import { pickMetricTone, yesNoTone } from '@/lib/value-tone';

export type HeroMetricCategory = 'quality' | 'payment' | 'rainfall' | 'market';

export type HeroMetricViz =
  | { type: 'none' }
  | { type: 'ring'; pct: number }
  | { type: 'stars'; filled: number; max: number }
  | { type: 'bar'; pct: number; invert?: boolean }
  | { type: 'pie'; values: [number, number, number, number] }
  | { type: 'rank'; pct: number };

export interface HeroMetricTile {
  id: string;
  label: string;
  value: string;
  sub: string | null;
  tone: CompareTone;
  icon: string;
  viz: HeroMetricViz;
  explainerTitle: string;
  explainerBody: string;
  takeaway: string;
}

export interface HeroMetricCategoryPanel {
  id: HeroMetricCategory;
  label: string;
  icon: string;
  tiles: HeroMetricTile[];
}

function parseNum(v: string | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function tile(
  id: string,
  label: string,
  value: string,
  icon: string,
  viz: HeroMetricViz,
  compare: ReturnType<typeof compareToBenchmark> | null,
  overrides?: { tone?: CompareTone; sub?: string | null },
): HeroMetricTile {
  const explainer = METRIC_EXPLAINERS[label] ?? { title: label, body: '' };
  const tone = pickMetricTone(value, compare?.tone ?? 'neutral', overrides?.tone);
  const sub = overrides?.sub ?? compare?.detail ?? null;
  return {
    id,
    label,
    value,
    sub,
    tone,
    icon,
    viz,
    explainerTitle: explainer.title,
    explainerBody: explainer.body,
    takeaway: metricTakeaway({ tone, label, peerDetail: sub }),
  };
}

export function buildProfileHeroCategories(input: {
  hospital: TeamHospital;
  record?: DirectoryHospital;
  publicProfile?: HospitalPublicProfile;
}): { categories: HeroMetricCategoryPanel[]; summary: ProfileMetricsSummary } {
  const { hospital, record, publicProfile } = input;
  const { summary } = buildProfileMetricTiles(input);
  const stateBench = stateBenchmarks[hospital.state];
  const g = publicProfile?.general;
  const hrrp = publicProfile?.hrrp;
  const hvbp = publicProfile?.hvbp;
  const mspbScore = record?.mspbScore ?? publicProfile?.mspb?.score ?? null;
  const hcahpsStar = record?.hcahpsStar ?? parseNum(publicProfile?.hcahps?.starRating);
  const stars = record?.overallRating ?? parseNum(g?.overallRating);
  const hvbpTps = record?.hvbpTps ?? hvbp?.totalPerformanceScore ?? null;
  const beds =
    record?.beds ??
    (publicProfile?.costReport?.numberOfBeds
      ? Number(publicProfile.costReport.numberOfBeds.replace(/,/g, ''))
      : null);
  const hacrpYes = record?.hacrpPenalty ?? publicProfile?.hacrp?.paymentReduction === 'Yes';
  const hrrpAvg =
    record?.hrrpAvgExcess ?? hrrp?.avgExcessReadmissionRatio ?? null;
  const hrrpAbove =
    record?.hrrpConditionsAbovePeers ?? hrrp?.conditionsAbovePeers ?? null;

  const starsCompare = compareToBenchmark({
    value: stars,
    benchmark: stateBench?.medianStars ?? researchBenchmarks.medianStars,
    metric: 'CMS stars',
    peerLabel: `${hospital.state} median`,
  });
  const hcahpsCompare = compareToBenchmark({
    value: hcahpsStar,
    benchmark: stateBench?.medianHcahpsStar ?? researchBenchmarks.medianHcahpsStar,
    metric: 'HCAHPS stars',
    peerLabel: `${hospital.state} median`,
  });
  const hvbpCompare = compareToBenchmark({
    value: hvbpTps,
    benchmark: stateBench?.medianHvbpTps ?? researchBenchmarks.medianHvbpTps,
    metric: 'HVBP score',
    peerLabel: `${hospital.state} median`,
    format: (n) => String(Math.round(n)),
  });
  const mspbCompare = compareToBenchmark({
    value: mspbScore,
    benchmark: stateBench?.medianMspb ?? researchBenchmarks.medianMspb,
    lowerIsBetter: true,
    metric: 'MSPB index',
    peerLabel: `${hospital.state} median`,
    format: (n) => n.toFixed(2),
  });
  const bedsCompare = compareToBenchmark({
    value: beds,
    benchmark: stateBench?.medianBeds ?? researchBenchmarks.medianBeds,
    metric: 'Licensed beds',
    peerLabel: `${hospital.state} median`,
    format: (n) => n.toLocaleString('en-US'),
  });
  const cjrRank = record?.teamRankByCjr;
  const cjrPct =
    cjrRank != null
      ? Math.round(((TEAM_MANDATED_HOSPITAL_COUNT - cjrRank + 1) / TEAM_MANDATED_HOSPITAL_COUNT) * 100)
      : null;

  const hvbpPieValues: [number, number, number, number] | null =
    hvbp &&
    [hvbp.clinicalOutcomes, hvbp.patientExperience, hvbp.safety, hvbp.efficiency].some((v) => v != null)
      ? [
          hvbp.clinicalOutcomes ?? 0,
          hvbp.patientExperience ?? 0,
          hvbp.safety ?? 0,
          hvbp.efficiency ?? 0,
        ]
      : null;

  const quality: HeroMetricTile[] = [
    tile(
      'stars',
      'CMS stars',
      stars != null ? `${stars} / 5` : '—',
      'ph:star',
      stars != null ? { type: 'stars', filled: stars, max: 5 } : { type: 'none' },
      starsCompare,
    ),
    tile(
      'hcahps',
      'HCAHPS stars',
      hcahpsStar != null ? `${hcahpsStar} / 5` : '—',
      'ph:users-three',
      hcahpsStar != null ? { type: 'stars', filled: hcahpsStar, max: 5 } : { type: 'none' },
      hcahpsCompare,
    ),
    tile(
      'hrrp-avg',
      'HRRP avg excess',
      hrrpAvg != null ? hrrpAvg.toFixed(3) : '—',
      'ph:arrow-counter-clockwise',
      hrrpAvg != null
        ? { type: 'bar', pct: Math.min(100, (hrrpAvg / 1.5) * 100), invert: true }
        : { type: 'none' },
      null,
      {
        tone: hrrpAvg != null && hrrpAvg > 1 ? 'warn' : hrrpAvg != null ? 'good' : 'neutral',
        sub: hrrpAvg != null && hrrpAvg > 1 ? 'Above 1.0 = worse readmissions' : 'At or below peer expectation',
      },
    ),
    tile(
      'hrrp-above',
      'HRRP above peers',
      hrrpAbove != null ? String(hrrpAbove) : '—',
      'ph:warning-circle',
      hrrpAbove != null ? { type: 'ring', pct: Math.min(100, hrrpAbove * 20) } : { type: 'none' },
      null,
      {
        tone: hrrpAbove != null && hrrpAbove >= 3 ? 'warn' : 'neutral',
        sub: 'Condition measures with excess ratio > 1',
      },
    ),
    tile(
      'hacrp',
      'HACRP penalty',
      hacrpYes ? 'Yes' : publicProfile?.hacrp ? 'No' : '—',
      'ph:shield-warning',
      { type: 'none' },
      null,
      {
        tone:
          yesNoTone(hacrpYes ? 'Yes' : publicProfile?.hacrp ? 'No' : '', { invert: true }) ?? 'neutral',
        sub: hacrpYes ? '1% Medicare payment reduction' : publicProfile?.hacrp ? 'No reduction' : null,
      },
    ),
  ];

  const payment: HeroMetricTile[] = [
    tile(
      'hvbp',
      'HVBP score',
      hvbpTps != null ? String(Math.round(hvbpTps)) : '—',
      'ph:chart-line-up',
      hvbpTps != null ? { type: 'ring', pct: Math.min(100, hvbpTps) } : { type: 'none' },
      hvbpCompare,
    ),
    tile(
      'mspb',
      'MSPB index',
      mspbScore != null ? mspbScore.toFixed(2) : '—',
      'ph:currency-dollar',
      mspbScore != null
        ? { type: 'bar', pct: Math.min(100, (mspbScore / 1.4) * 100), invert: true }
        : { type: 'none' },
      mspbCompare,
    ),
    tile(
      'hvbp-pie',
      'HVBP domains',
      hvbp ? `${Math.round(hvbp.totalPerformanceScore ?? 0)} TPS` : '—',
      'ph:chart-pie-slice',
      hvbpPieValues ? { type: 'pie', values: hvbpPieValues } : { type: 'none' },
      null,
      {
        sub: hvbp ? 'Clinical · experience · safety · efficiency' : null,
      },
    ),
    tile(
      'hacrp-pay',
      'HACRP status',
      hacrpYes ? 'Penalty' : publicProfile?.hacrp ? 'Clear' : '—',
      'ph:scales',
      { type: 'none' },
      null,
      {
        tone:
          (hacrpYes ? 'warn' : publicProfile?.hacrp ? 'good' : null) ??
          yesNoTone(hacrpYes ? 'Penalty' : publicProfile?.hacrp ? 'Clear' : '') ??
          'neutral',
        sub: publicProfile?.hacrp?.totalHacScore != null
          ? `HAC score ${Number(publicProfile.hacrp.totalHacScore).toFixed(3)}`
          : null,
      },
    ),
    tile(
      'psi',
      'PSI-90 (proxy)',
      publicProfile?.hacrp?.psi90 != null ? Number(publicProfile.hacrp.psi90).toFixed(3) : '—',
      'ph:cross',
      { type: 'none' },
      null,
      { sub: 'Patient safety indicator composite' },
    ),
  ];

  const rainfall: HeroMetricTile[] = [
    tile(
      'cjr',
      'TEAM rank (CJR)',
      cjrRank != null ? `#${cjrRank}` : '—',
      'ph:trophy',
      cjrPct != null ? { type: 'rank', pct: cjrPct } : { type: 'none' },
      null,
      {
        sub: cjrRank != null ? teamRankTakeaway(cjrRank, TEAM_MANDATED_HOSPITAL_COUNT) : null,
        tone: cjrRank != null && cjrRank <= 50 ? 'good' : cjrRank != null && cjrRank > 400 ? 'warn' : 'neutral',
      },
    ),
    tile(
      'top50',
      'CJR top 50',
      record?.cjrTop50 ? 'Yes' : 'No',
      'ph:medal',
      { type: 'none' },
      null,
      { sub: 'Internal Rainfall prioritization flag' },
    ),
    tile(
      'outreach',
      'Outreach',
      record?.outreachStatus ?? '—',
      'ph:phone-outgoing',
      { type: 'none' },
      null,
      { sub: 'Master Tracker outreach status' },
    ),
    tile(
      'pipeline',
      'Pipeline',
      record?.pipelineStatus ?? '—',
      'ph:flow-arrow',
      { type: 'none' },
      null,
      { sub: record?.salesStage ? `Stage: ${record.salesStage}` : null },
    ),
    tile(
      'tcv',
      'Est. TCV',
      record?.estTcv != null ? `$${record.estTcv.toLocaleString('en-US')}` : '—',
      'ph:briefcase',
      { type: 'none' },
      null,
      { sub: 'Internal estimated total contract value' },
    ),
  ];

  const market: HeroMetricTile[] = [
    tile(
      'beds',
      'Licensed beds',
      beds != null ? beds.toLocaleString('en-US') : '—',
      'ph:bed',
      beds != null && stateBench?.medianBeds
        ? { type: 'bar', pct: Math.min(100, (beds / (stateBench.medianBeds * 2)) * 100) }
        : { type: 'none' },
      bedsCompare,
    ),
    tile(
      'disch',
      'Discharges',
      record?.discharges != null ? record.discharges.toLocaleString('en-US') : '—',
      'ph:arrow-square-out',
      { type: 'none' },
      null,
      { sub: 'Annual discharges (cost report)' },
    ),
    tile(
      'county-pop',
      'County population',
      record?.population != null ? record.population.toLocaleString('en-US') : '—',
      'ph:map-pin',
      { type: 'none' },
      null,
      {
        sub:
          record?.medianIncome != null
            ? `Median income $${record.medianIncome.toLocaleString('en-US')}`
            : null,
      },
    ),
    tile(
      'cbsa',
      'CBSA population',
      record?.cbsaPopulation != null ? record.cbsaPopulation.toLocaleString('en-US') : '—',
      'ph:buildings',
      { type: 'none' },
      null,
      { sub: record?.cbsaName ?? hospital.city ?? null },
    ),
    tile(
      'setting',
      'Setting',
      record?.ruralUrban === 'R' ? 'Rural' : record?.ruralUrban === 'U' ? 'Urban' : '—',
      'ph:tree',
      { type: 'none' },
      null,
      { sub: g?.ownership ?? record?.ownership ?? null },
    ),
  ];

  const categories: HeroMetricCategoryPanel[] = [
    { id: 'quality', label: 'Quality', icon: 'ph:heartbeat', tiles: quality },
    { id: 'payment', label: 'Payment', icon: 'ph:wallet', tiles: payment },
    { id: 'rainfall', label: 'Rainfall', icon: 'ph:cloud-rain', tiles: rainfall },
    { id: 'market', label: 'Market', icon: 'ph:chart-bar', tiles: market },
  ];

  return { categories, summary };
}
