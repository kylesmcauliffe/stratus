/**
 * Static TEAM program context for research profiles (CMS public sources).
 * Rainfall Health builds RAIN Compliant™ workflows around this mandate.
 */
export const TEAM_MANDATE_DATE = '2026-01-01';

export const TEAM_PROCEDURE_FAMILIES = [
  { id: 'cabg', label: 'Coronary artery bypass graft (CABG)' },
  { id: 'lejr', label: 'Lower extremity joint replacement' },
  { id: 'bowel', label: 'Major bowel procedures' },
  { id: 'hip-fracture', label: 'Hip fracture treatment' },
  { id: 'spinal-fusion', label: 'Spinal fusion' },
] as const;

export const TEAM_TRACKS = [
  { id: '1', label: 'Track 1', risk: 'Limited downside in early years for many participants' },
  { id: '2', label: 'Track 2', risk: 'Moderate two-sided risk' },
  { id: '3', label: 'Track 3', risk: 'Highest upside and downside' },
] as const;

export const teamProgramLinks = [
  {
    label: 'CMS TEAM model overview',
    url: 'https://www.cms.gov/priorities/innovation/innovation-models/team',
  },
  {
    label: 'TEAM participant list (XLSX)',
    url: 'https://www.cms.gov/team-model-participant-list',
  },
  {
    label: 'Hospital Compare — HRRP',
    url: 'https://data.cms.gov/provider-data/dataset/9n3s-kdb3',
  },
] as const;

export const rainfallResearchAngles = [
  'Episode-level accountability across the surgical stay and 30-day post-discharge window',
  'Quality (readmissions, HACRP, HVBP) tied directly to Medicare payment adjustments',
  'Referral network and post-acute alignment — core to RAIN Compliant™ referral accountability',
  'Scale signals: beds, discharges, MSPB, and metro/county market context for prioritization',
] as const;
