import { directoryHospitals } from '@/lib/directory-index';
import {
  compareToBenchmark,
  researchBenchmarks,
  type CompareTone,
} from '@/lib/research-benchmarks';
import {
  cjrTone,
  mspbTone,
  outreachTone,
  starsTone,
} from '@/lib/visual-indicators';

export interface RollupTableRowData {
  count: number;
  medianCjr: number | null;
  pctOutreach: number;
  medianStars: number | null;
  medianBeds: number | null;
  totalBeds: number;
  medianMspb: number | null;
  cjrTop50: number;
  pctPipeline: number;
}

const nat = researchBenchmarks;

const nationalPctPipeline = Math.round(
  (directoryHospitals.filter((h) => h.pipelineStatus).length / directoryHospitals.length) * 100,
);

const nationalTop50Share = Math.round(
  (directoryHospitals.filter((h) => h.cjrTop50).length / directoryHospitals.length) * 100,
);

const medianStateHospitalCount = Math.round(directoryHospitals.length / 45);

function cjrTop50ShareTone(top50: number, count: number): CompareTone {
  if (count <= 0) return 'neutral';
  const share = Math.round((top50 / count) * 100);
  if (share > nationalTop50Share + 8) return 'good';
  if (share < nationalTop50Share - 8) return 'warn';
  return 'neutral';
}

function pipelineTone(pct: number): CompareTone {
  if (pct > nationalPctPipeline + 5) return 'good';
  if (pct < nationalPctPipeline - 5) return 'warn';
  return 'neutral';
}

function hospitalCountTone(count: number): CompareTone {
  if (count > medianStateHospitalCount * 1.35) return 'good';
  if (count < medianStateHospitalCount * 0.5) return 'warn';
  return 'neutral';
}

/** Per-column compare tone vs national TEAM benchmarks (for rollup table cells). */
export function rollupMetricTones(row: RollupTableRowData): Record<string, CompareTone> {
  const cjrCmp = compareToBenchmark({
    value: row.medianCjr,
    benchmark: nat.medianTeamRankCjr,
    lowerIsBetter: true,
    metric: 'Median CJR',
    peerLabel: 'national',
    format: (n) => `#${Math.round(n)}`,
  });
  const mspbCmp = compareToBenchmark({
    value: row.medianMspb,
    benchmark: nat.medianMspb,
    lowerIsBetter: true,
    metric: 'MSPB',
    peerLabel: 'national',
    format: (n) => n.toFixed(2),
  });

  return {
    count: hospitalCountTone(row.count),
    'median-cjr': cjrCmp?.tone ?? cjrTone(row.medianCjr, nat.medianTeamRankCjr),
    'cjr-top50': cjrTop50ShareTone(row.cjrTop50, row.count),
    outreach: outreachTone(row.pctOutreach, nat.pctOutreachYes ?? 0),
    pipeline: pipelineTone(row.pctPipeline),
    stars: starsTone(row.medianStars, nat.medianStars),
    'median-beds': 'neutral',
    'total-beds': 'neutral',
    mspb: mspbCmp?.tone ?? mspbTone(row.medianMspb, nat.medianMspb),
  };
}
