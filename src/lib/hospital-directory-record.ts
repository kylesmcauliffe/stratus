import type { TeamHospital } from '@/data/team-hospitals';
import type { HospitalPublicProfile } from '@/data/hospital-public-profile';

export interface CountyDemographics {
  population: number | null;
  medianIncome: number | null;
  countyName: string;
  state: string;
}

export interface CbsaDemographics {
  cbsa: string;
  name: string;
  population: number | null;
  medianIncome: number | null;
}

export interface DirectoryHospital {
  slug: string;
  name: string;
  state: string;
  city?: string;
  ccn?: string;
  healthSystem?: string;
  streetCity?: string;
  address?: string;
  zip?: string;
  county?: string;
  phone?: string;
  hospitalType?: string;
  ownership?: string;
  emergencyServices?: string;
  overallRating: number | null;
  beds: number | null;
  discharges: number | null;
  fte: number | null;
  ruralUrban?: string;
  medicareCbsaNumber?: string;
  cbsaName?: string;
  population: number | null;
  medianIncome: number | null;
  cbsaPopulation: number | null;
  cbsaMedianIncome: number | null;
  hcahpsStar: number | null;
  hvbpTps: number | null;
  mspbScore: number | null;
  hacrpPenalty: boolean;
  hrrpAvgExcess: number | null;
  hrrpConditionsAbovePeers: number | null;
  region?: string;
  teamRankByCjr?: number | null;
  cjrTop50?: boolean | null;
  cjrQualityComposite?: number | null;
  cjrOverallRank?: number | null;
  outreachStatus?: string;
  pipelineStatus?: string;
  salesStage?: string;
  leadershipBuyIn?: string;
  systemSiteCount?: number | null;
  estTcv?: number | null;
}

export function countyDemographicsKey(state: string, county: string): string {
  const st = state.trim().toUpperCase();
  const co = county
    .trim()
    .toUpperCase()
    .replace(/\s+COUNTY$/i, '')
    .replace(/\s+PARISH$/i, '')
    .replace(/\s+BOROUGH$/i, '')
    .replace(/\s+CITY$/i, '');
  return `${st}|${co}`;
}

function parseNum(value: string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function buildDirectoryRecord(
  hospital: TeamHospital,
  publicProfile: HospitalPublicProfile | undefined,
  countyDemo: CountyDemographics | undefined,
  cbsaDemo: CbsaDemographics | undefined,
): DirectoryHospital {
  const g = publicProfile?.general;
  const c = publicProfile?.costReport;

  return {
    slug: hospital.slug,
    name: hospital.name,
    state: hospital.state,
    city: hospital.city,
    ccn: hospital.ccn,
    healthSystem: hospital.healthSystem,
    streetCity: g?.city,
    address: g?.address,
    zip: g?.zip,
    county: g?.county,
    phone: g?.phone,
    hospitalType: g?.hospitalType,
    ownership: g?.ownership,
    emergencyServices: g?.emergencyServices,
    overallRating: parseNum(g?.overallRating ?? null),
    beds: parseNum(c?.numberOfBeds ?? null),
    discharges: parseNum(c?.totalDischarges ?? null),
    fte: parseNum(c?.fteEmployees ?? null),
    ruralUrban: c?.ruralUrban ?? undefined,
    medicareCbsaNumber: c?.medicareCbsaNumber ?? undefined,
    cbsaName: cbsaDemo?.name,
    population: countyDemo?.population ?? null,
    medianIncome: countyDemo?.medianIncome ?? null,
    cbsaPopulation: cbsaDemo?.population ?? null,
    cbsaMedianIncome: cbsaDemo?.medianIncome ?? null,
    hcahpsStar: parseNum(publicProfile?.hcahps?.starRating ?? null),
    hvbpTps: publicProfile?.hvbp?.totalPerformanceScore ?? null,
    mspbScore: publicProfile?.mspb?.score ?? null,
    hacrpPenalty: publicProfile?.hacrp?.paymentReduction === 'Yes',
    hrrpAvgExcess: publicProfile?.hrrp?.avgExcessReadmissionRatio ?? null,
    hrrpConditionsAbovePeers: publicProfile?.hrrp?.conditionsAbovePeers ?? null,
  };
}

export function systemSlugFromName(systemName: string): string {
  return systemName
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
