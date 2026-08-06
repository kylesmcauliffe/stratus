/** CMS TEAM program copy for profile pages and llms.txt */

export const TEAM_CMS_MODEL_URL =
  'https://www.cms.gov/priorities/innovation/innovation-models/team-model';

export const TEAM_PARTICIPANT_LIST_URL = 'https://www.cms.gov/team-model-participant-list';

export const TEAM_EXPLAINER_SUMMARY =
  'The Transforming Episode Accountability Model (TEAM) is a mandatory Medicare bundled-payment program from CMS that holds selected acute-care hospitals accountable for the cost and quality of five high-volume surgical episodes from admission through 30 days post-discharge. The model runs five performance years beginning January 1, 2026.';

export const teamExplainerSections = [
  {
    title: 'What is TEAM?',
    body: `The Transforming Episode Accountability Model (TEAM) is a CMS initiative that shifts Medicare surgical care toward value-based accountability. Mandated hospitals must manage cost and quality across the full episode—not only the inpatient stay—including the 30-day post-discharge window.`,
  },
  {
    title: 'Episode accountability',
    body: `Under TEAM, hospitals are financially responsible for outcomes and spending across five procedure families (including CABG, lower extremity joint replacement, major bowel, hip fracture treatment, and spinal fusion). Poor quality or excess episode cost can trigger penalties; strong performance can earn rewards depending on the participation track.`,
  },
  {
    title: 'Tracks and risk',
    body: `TEAM offers graduated tracks: Track 1 (no downside risk in early years for many hospitals), Track 2 (moderate two-sided risk), and Track 3 (highest risk and reward). Safety-net and rural hospitals may have different track eligibility and deferral options than other participants.`,
  },
  {
    title: 'Quality measurement',
    body: `Hospitals are evaluated on episode quality measures, including readmissions and model-specific Composite Quality Score (CQS) components. Quality performance affects whether cost savings are retained or whether penalties apply.`,
  },
] as const;
