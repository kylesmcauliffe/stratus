import trackerJson from '@/data/hospital-rainfall-tracker.json';

export interface RainfallTrackerRecord {
  hospitalName: string;
  ccn: string;
  healthSystem?: string;
  metro?: string;
  state?: string;
  region?: string;
  cbsaCode?: string;
  participantType?: string;
  newlyIdentified?: boolean;
  teamRankByCjr?: number | null;
  cjrTop50?: boolean | null;
  cjrQualityComposite?: number | null;
  cjrOverallRank?: number | null;
  outreachStatus?: string;
  systemSiteCount?: number | null;
  pipelineStatus?: string;
  salesStage?: string;
  leadershipBuyIn?: string;
  acvTrack1?: number | null;
  acvTrack2?: number | null;
  estTcv?: number | null;
  healthSystemImpact?: number | null;
  contactName?: string;
  contactEmail?: string;
  contactTitle?: string;
  contactPhone?: string;
  additionalContacts?: { name?: string; email?: string; title?: string; phone?: string }[];
  nextSteps?: string;
}

interface TrackerFile {
  generatedAt: string;
  source: string;
  count: number;
  byCcn: Record<string, RainfallTrackerRecord>;
}

const store = trackerJson as TrackerFile;

export const rainfallTrackerGeneratedAt = store.generatedAt;

export function getRainfallTrackerByCcn(ccn: string | undefined): RainfallTrackerRecord | undefined {
  if (!ccn) return undefined;
  const key = ccn.replace(/\D/g, '').padStart(6, '0');
  return store.byCcn[key];
}

export function rainfallTrackerFilterOptions() {
  const regions = new Set<string>();
  const pipelines = new Set<string>();
  const stages = new Set<string>();
  const outreach = new Set<string>();
  for (const r of Object.values(store.byCcn)) {
    if (r.region) regions.add(r.region);
    if (r.pipelineStatus) pipelines.add(r.pipelineStatus);
    if (r.salesStage) stages.add(r.salesStage);
    if (r.outreachStatus) outreach.add(r.outreachStatus);
  }
  return {
    regions: [...regions].sort(),
    pipelineStatuses: [...pipelines].sort(),
    salesStages: [...stages].sort(),
    outreachStatuses: [...outreach].sort(),
  };
}
