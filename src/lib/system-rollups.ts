import type { DirectoryHospital } from '@/lib/hospital-directory-record';

export function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

export interface PipelineBreakdown {
  label: string;
  count: number;
}

export interface SystemRollup {
  hospitalCount: number;
  totalBeds: number;
  medianBeds: number | null;
  medianStars: number | null;
  medianMspb: number | null;
  medianHvbpTps: number | null;
  medianHcahpsStar: number | null;
  medianTeamRankCjr: number | null;
  pctOutreachYes: number;
  cjrTop50Count: number;
  totalEstTcv: number;
  pipelineBreakdown: PipelineBreakdown[];
  salesStageBreakdown: PipelineBreakdown[];
  states: string[];
}

export function rollupHospitals(hospitals: DirectoryHospital[]): SystemRollup {
  const beds = hospitals.map((h) => h.beds).filter((n): n is number => n != null);
  const stars = hospitals.map((h) => h.overallRating).filter((n): n is number => n != null);
  const mspb = hospitals.map((h) => h.mspbScore).filter((n): n is number => n != null);
  const hvbp = hospitals.map((h) => h.hvbpTps).filter((n): n is number => n != null);
  const hcahps = hospitals.map((h) => h.hcahpsStar).filter((n): n is number => n != null);
  const cjr = hospitals.map((h) => h.teamRankByCjr).filter((n): n is number => n != null);
  const outreachYes = hospitals.filter((h) => h.outreachStatus === 'Yes').length;
  const cjrTop50Count = hospitals.filter((h) => h.cjrTop50).length;
  const totalEstTcv = hospitals.reduce((sum, h) => sum + (h.estTcv ?? 0), 0);

  const pipelineCounts = new Map<string, number>();
  const stageCounts = new Map<string, number>();
  for (const h of hospitals) {
    if (h.pipelineStatus) {
      pipelineCounts.set(h.pipelineStatus, (pipelineCounts.get(h.pipelineStatus) ?? 0) + 1);
    }
    if (h.salesStage) {
      stageCounts.set(h.salesStage, (stageCounts.get(h.salesStage) ?? 0) + 1);
    }
  }

  const toBreakdown = (m: Map<string, number>) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));

  return {
    hospitalCount: hospitals.length,
    totalBeds: beds.reduce((a, b) => a + b, 0),
    medianBeds: median(beds),
    medianStars: median(stars),
    medianMspb: median(mspb),
    medianHvbpTps: median(hvbp),
    medianHcahpsStar: median(hcahps),
    medianTeamRankCjr: median(cjr),
    pctOutreachYes: hospitals.length ? Math.round((outreachYes / hospitals.length) * 100) : 0,
    cjrTop50Count,
    totalEstTcv,
    pipelineBreakdown: toBreakdown(pipelineCounts),
    salesStageBreakdown: toBreakdown(stageCounts),
    states: [...new Set(hospitals.map((h) => h.state))].sort(),
  };
}
