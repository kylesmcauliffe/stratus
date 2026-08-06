import type { TeamHospital } from '@/data/team-hospitals';
import type { HospitalPublicProfile } from '@/data/hospital-public-profile';
import type { DirectoryHospital } from '@/lib/hospital-directory-record';
import {
  compareToBenchmark,
  researchBenchmarks,
  stateBenchmarks,
  type CompareTone,
} from '@/lib/research-benchmarks';
import { METRIC_EXPLAINERS, metricTakeaway } from '@/lib/metric-explainers';
import { pickMetricTone, yesNoTone } from '@/lib/value-tone';

export interface ProfileMetricTile {
  id: string;
  label: string;
  value: string;
  sub: string | null;
  tone: CompareTone;
  explainerTitle: string;
  explainerBody: string;
  takeaway: string;
}

export interface ProfileMetricsSummary {
  goodCount: number;
  warnCount: number;
  headline: string;
}

function parseNum(v: string | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function buildProfileMetricTiles(input: {
  hospital: TeamHospital;
  record?: DirectoryHospital;
  publicProfile?: HospitalPublicProfile;
}): { tiles: ProfileMetricTile[]; summary: ProfileMetricsSummary } {
  const { hospital, record, publicProfile } = input;
  const stateBench = stateBenchmarks[hospital.state];

  const beds =
    record?.beds ??
    (publicProfile?.costReport?.numberOfBeds
      ? Number(publicProfile.costReport.numberOfBeds.replace(/,/g, ''))
      : null);
  const stars =
    record?.overallRating ??
    (publicProfile?.general.overallRating ? Number(publicProfile.general.overallRating) : null);
  const hcahpsStar = record?.hcahpsStar ?? parseNum(publicProfile?.hcahps?.starRating);
  const hvbpTps = record?.hvbpTps ?? publicProfile?.hvbp?.totalPerformanceScore ?? null;
  const mspb = record?.mspbScore ?? publicProfile?.mspb?.score ?? null;

  const hacrpYes = record?.hacrpPenalty ?? publicProfile?.hacrp?.paymentReduction === 'Yes';

  function tile(
    id: string,
    label: string,
    value: string,
    compare: ReturnType<typeof compareToBenchmark>,
    overrides?: { tone?: CompareTone; sub?: string | null },
  ): ProfileMetricTile {
    const explainer = METRIC_EXPLAINERS[label] ?? { title: label, body: '' };
    const tone = pickMetricTone(value, compare?.tone ?? 'neutral', overrides?.tone);
    const sub = overrides?.sub ?? compare?.detail ?? null;
    return {
      id,
      label,
      value,
      sub,
      tone,
      explainerTitle: explainer.title,
      explainerBody: explainer.body,
      takeaway: metricTakeaway({ tone, label, peerDetail: sub }),
    };
  }

  const starsCompare = compareToBenchmark({
    value: stars,
    benchmark: stateBench?.medianStars ?? researchBenchmarks.medianStars,
    metric: 'CMS stars',
    peerLabel: `${hospital.state} median`,
  });
  const hcahpsCompare = compareToBenchmark({
    value: hcahpsStar,
    benchmark: stateBench?.medianHcahpsStar ?? researchBenchmarks.medianHcahpsStar,
    metric: 'HCAHPS',
    peerLabel: `${hospital.state} median`,
  });
  const hvbpCompare = compareToBenchmark({
    value: hvbpTps,
    benchmark: stateBench?.medianHvbpTps ?? researchBenchmarks.medianHvbpTps,
    metric: 'HVBP',
    peerLabel: `${hospital.state} median`,
    format: (n) => String(Math.round(n)),
  });
  const mspbCompare = compareToBenchmark({
    value: mspb,
    benchmark: stateBench?.medianMspb ?? researchBenchmarks.medianMspb,
    lowerIsBetter: true,
    metric: 'MSPB',
    peerLabel: `${hospital.state} median`,
    format: (n) => n.toFixed(2),
  });
  const bedsCompare = compareToBenchmark({
    value: beds,
    benchmark: stateBench?.medianBeds ?? researchBenchmarks.medianBeds,
    metric: 'Beds',
    peerLabel: `${hospital.state} median`,
    format: (n) => n.toLocaleString('en-US'),
  });

  const tiles: ProfileMetricTile[] = [
    tile('stars', 'CMS stars', stars != null ? `${stars} / 5` : '—', starsCompare),
    tile(
      'hcahps',
      'HCAHPS stars',
      hcahpsStar != null ? `${hcahpsStar} / 5` : '—',
      hcahpsCompare,
    ),
    tile('hvbp', 'HVBP score', hvbpTps != null ? String(Math.round(hvbpTps)) : '—', hvbpCompare),
    tile('mspb', 'MSPB index', mspb != null ? mspb.toFixed(2) : '—', mspbCompare),
    tile('beds', 'Licensed beds', beds != null ? beds.toLocaleString('en-US') : '—', bedsCompare),
    tile('hacrp', 'HACRP penalty', hacrpYes ? 'Yes' : publicProfile?.hacrp ? 'No' : '—', null, {
      tone: yesNoTone(hacrpYes ? 'Yes' : publicProfile?.hacrp ? 'No' : '', { invert: true }) ?? 'neutral',
      sub: hacrpYes ? '1% Medicare payment reduction' : publicProfile?.hacrp ? 'No reduction' : null,
    }),
  ];

  const qualityTiles = tiles.filter((t) => t.id !== 'beds');
  const goodCount = qualityTiles.filter((t) => t.tone === 'good').length;
  const warnCount = qualityTiles.filter((t) => t.tone === 'warn').length;

  let headline = 'Mixed quality signals vs state peers';
  if (warnCount >= 3) headline = 'Several metrics below state peer medians';
  else if (goodCount >= 3 && warnCount === 0) headline = 'Generally at or above state peer medians';
  else if (goodCount >= 2 && warnCount <= 1) headline = 'Mostly favorable vs state peers';

  return { tiles, summary: { goodCount, warnCount, headline } };
}

export const PROFILE_METRIC_TONE_CLASS: Record<CompareTone, string> = {
  good: 'profile-metric profile-metric--good',
  warn: 'profile-metric profile-metric--warn',
  neutral: 'profile-metric profile-metric--neutral',
};
