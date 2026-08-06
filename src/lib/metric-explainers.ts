import type { CompareTone } from '@/lib/research-benchmarks';

export interface MetricExplainer {
  title: string;
  body: string;
}

export const METRIC_EXPLAINERS: Record<string, MetricExplainer> = {
  'CMS stars': {
    title: 'CMS overall star rating',
    body: 'Medicare’s 1–5 summary of hospital quality on Care Compare. Higher is better. Compared to other TEAM hospitals in the same state.',
  },
  'HCAHPS stars': {
    title: 'Patient experience (HCAHPS)',
    body: 'Summary star from the Hospital Consumer Assessment of Healthcare Providers and Systems survey. Reflects patient-reported experience, not clinical outcomes alone.',
  },
  'HVBP score': {
    title: 'Hospital Value-Based Purchasing (HVBP)',
    body: 'Total Performance Score (0–100) used in Medicare’s HVBP program. Higher scores can mean larger payment adjustments. Domains include outcomes, experience, safety, and efficiency.',
  },
  'HVBP TPS': {
    title: 'Hospital Value-Based Purchasing (HVBP)',
    body: 'Total Performance Score (0–100) used in Medicare’s HVBP program. Higher scores can mean larger payment adjustments. Compared to the state median among TEAM hospitals.',
  },
  MSPB: {
    title: 'Medicare Spending Per Beneficiary (MSPB)',
    body: 'Index where 1.00 is the national average for similar episodes. Lower means less Medicare spend per beneficiary — better for efficiency comparisons.',
  },
  'MSPB index': {
    title: 'Medicare Spending Per Beneficiary (MSPB)',
    body: 'Index where 1.00 is the national average for similar episodes. Lower means less Medicare spend per beneficiary — better for efficiency comparisons.',
  },
  'Licensed beds': {
    title: 'Licensed beds (cost report)',
    body: 'Beds from the CMS hospital cost report — a scale proxy, not current staffed capacity. Compared to the state median among TEAM hospitals.',
  },
  'HACRP penalty': {
    title: 'Hospital-Acquired Condition Reduction Program',
    body: '“Yes” means a 1% Medicare payment reduction for that fiscal year under HACRP, based on total HAC scores and PSI-90. “No” means no reduction on the latest CMS file.',
  },
  'HRRP avg excess': {
    title: 'Hospital Readmissions Reduction Program',
    body: 'Average excess readmission ratio across reported condition measures. Values above 1.0 mean worse-than-expected readmissions vs national peers.',
  },
  'HRRP above peers': {
    title: 'HRRP measures above peers',
    body: 'Count of condition-specific readmission measures where the hospital’s excess ratio is greater than 1.0 (worse than expected).',
  },
  'HVBP domains': {
    title: 'HVBP domain mix',
    body: 'How the Hospital Value-Based Purchasing Total Performance Score splits across clinical outcomes, patient experience, safety, and efficiency (MSPB) domains.',
  },
  'PSI-90 (proxy)': {
    title: 'Patient Safety Indicator 90',
    body: 'Composite patient safety score used in HACRP. Values above 1.0 suggest worse-than-expected safety events vs peers.',
  },
  'TEAM rank (CJR)': {
    title: 'Rainfall CJR prioritization rank',
    body: 'Internal composite rank across all CMS TEAM mandated hospitals. Lower rank = higher outreach priority in Rainfall’s tracker.',
  },
  'CJR top 50': {
    title: 'CJR top-50 flag',
    body: 'Internal flag for hospitals in the top 50 on Rainfall’s CJR composite — typically highest-priority for TEAM conversations.',
  },
  Outreach: {
    title: 'Rainfall outreach status',
    body: 'Whether Rainfall has active outreach to this hospital per the Master Tracker.',
  },
  Pipeline: {
    title: 'Rainfall pipeline status',
    body: 'Current sales/pipeline bucket (e.g. Demo, LOI/SOW Review, Prospecting) from the internal tracker.',
  },
  'Est. TCV': {
    title: 'Estimated total contract value',
    body: 'Internal Rainfall estimate of total contract value if the hospital adopts RAIN Compliant™.',
  },
  Discharges: {
    title: 'Annual discharges',
    body: 'Total discharges from the CMS hospital cost report — a volume scale proxy.',
  },
  'County population': {
    title: 'County service area population',
    body: 'Population of the hospital’s county from Census-linked directory data.',
  },
  'CBSA population': {
    title: 'Metro (CBSA) population',
    body: 'Population of the Core Based Statistical Area tied to the hospital’s Medicare CBSA code.',
  },
  Setting: {
    title: 'Rural / urban & ownership',
    body: 'Rural-referral classification from the cost report and CMS ownership category.',
  },
  'TEAM participation': {
    title: 'TEAM mandate status',
    body: 'Whether participation in CMS TEAM is mandatory or voluntary for this hospital on the 2026–2030 roster.',
  },
  'Medicare CCN': {
    title: 'CMS Certification Number',
    body: 'Six-digit CMS Certification Number (CCN) — primary key for Medicare hospital files and Care Compare.',
  },
  'Emergency services': {
    title: 'Emergency department',
    body: 'Whether CMS lists the hospital as providing emergency services.',
  },
  'Rainfall region': {
    title: 'Rainfall sales region',
    body: 'Internal geographic region from the Master Tracker used for territory planning.',
  },
  'System site count': {
    title: 'Health system footprint',
    body: 'Number of hospital sites affiliated with the parent health system in Rainfall’s tracker.',
  },
  'Median CMS ★': {
    title: 'Median CMS overall star rating',
    body: 'Median of each hospital’s latest CMS 1–5 overall star rating in this group, compared to the national TEAM cohort.',
  },
  'Median CJR': {
    title: 'Median Rainfall CJR rank',
    body: 'Median internal CJR prioritization rank (1 = highest priority). Lower is better vs the national TEAM median.',
  },
  'Median MSPB': {
    title: 'Median Medicare Spending Per Beneficiary',
    body: 'Median MSPB index for the group. Below 1.00 is better than national average episode spend.',
  },
  'Median HVBP': {
    title: 'Median HVBP Total Performance Score',
    body: 'Median Hospital Value-Based Purchasing score (0–100) for hospitals in this group.',
  },
  'Median HCAHPS': {
    title: 'Median patient experience stars',
    body: 'Median HCAHPS summary star rating (1–5) for hospitals in this group.',
  },
  '% outreach yes': {
    title: 'Share with active outreach',
    body: 'Percent of hospitals in this group where Rainfall outreach status is “Yes” on the Master Tracker.',
  },
  '% rural': {
    title: 'Share rural-designated',
    body: 'Percent of hospitals CMS classifies as rural in this group’s cost report / rural-referral fields.',
  },
  Hospitals: {
    title: 'Hospital count',
    body: 'Number of CMS TEAM mandated hospitals in this group on the 2026–2030 roster.',
  },
  States: {
    title: 'State footprint',
    body: 'Number of distinct states (or territories) where this group has at least one TEAM hospital.',
  },
};

export function metricTakeaway(input: {
  tone: CompareTone | undefined;
  label: string;
  peerDetail: string | null;
}): string {
  const { tone, label, peerDetail } = input;
  if (peerDetail) {
    if (tone === 'good') return `Takeaway: ${label} is stronger than typical peers (${peerDetail}).`;
    if (tone === 'warn') return `Takeaway: ${label} trails peers (${peerDetail}). Worth a closer look on the Quality tab.`;
    return `Takeaway: ${label} is in line with peers (${peerDetail}).`;
  }
  if (label === 'HACRP penalty') return 'Takeaway: No HACRP payment reduction on the latest CMS file.';
  return `Takeaway: See ${label} on Medicare Care Compare for methodology.`;
}

export function teamRankTakeaway(rank: number, rosterSize: number): string {
  const pct = Math.round(((rosterSize - rank + 1) / rosterSize) * 100);
  return `Rainfall CJR composite rank #${rank} of ${rosterSize} mandated hospitals (top ${pct}% on internal prioritization scale). Rank 1 = strongest composite among TEAM participants.`;
}
