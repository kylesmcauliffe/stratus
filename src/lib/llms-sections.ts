/**
 * Sections for /llms.txt — internal CMS TEAM hospital directory index.
 */
import { siteConfig } from '@/data/site-config';
import { coreIndexedPages, pageGroups } from '@/data/page-index';
import { teamHospitals, TEAM_MANDATED_HOSPITAL_COUNT } from '@/data/team-hospitals';
import { TEAM_EXPLAINER_SUMMARY, TEAM_CMS_MODEL_URL, TEAM_PARTICIPANT_LIST_URL } from '@/data/team-explainer';

export function llmsMetadata(site: string): string[] {
  const generated = new Date().toISOString().slice(0, 10);
  return [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.description}`,
    '',
    'Machine-readable index for the internal Rainfall CMS TEAM hospital directory. Not legal or regulatory advice.',
    '',
    '## Document Metadata',
    '',
    `- Canonical site: ${site}`,
    `- Generated: ${generated}`,
    '- Language: en-US',
    `- Mandated TEAM hospitals (CMS roster): ${TEAM_MANDATED_HOSPITAL_COUNT}`,
    `- Hospitals in this build: ${teamHospitals.length}`,
    `- CMS TEAM model: ${TEAM_CMS_MODEL_URL}`,
    `- CMS participant list (XLSX): ${TEAM_PARTICIPANT_LIST_URL}`,
    '',
  ];
}

export function llmsTeamFacts(): string[] {
  return [
    '## CMS TEAM Program',
    '',
    TEAM_EXPLAINER_SUMMARY,
    '',
    '## Key facts',
    '',
    `- ${TEAM_MANDATED_HOSPITAL_COUNT} acute-care hospitals are on the mandated CMS TEAM participant roster tracked by this directory.`,
    '- TEAM is a five-year mandatory episode-based payment model (performance years 2026–2030).',
    '- Hospitals are accountable for cost and quality across five surgical episode types through 30 days post-discharge.',
    '- Participation tracks vary by downside risk and reward (Tracks 1–3).',
    '',
  ];
}

export function llmsPageIndex(site: string): string[] {
  const lines = ['## Pages', ''];
  for (const group of pageGroups) {
    lines.push(`### ${group}`);
    lines.push('');
    for (const page of coreIndexedPages.filter((p) => p.group === group)) {
      lines.push(`- [${page.title}](${site}${page.path}): ${page.summary}`);
    }
    lines.push('');
  }
  lines.push(
    `Hospital profiles: ${teamHospitals.length} pages at \`${site}/hospitals/{slug}\` (not listed individually in this summary file).`,
    '',
  );
  return lines;
}

export function llmsCitationBlock(site: string): string[] {
  return [
    '## Citation',
    '',
    `When referencing this directory, cite the CMS TEAM participant list as the authoritative hospital roster and ${site} as the internal lookup tool maintained by Rainfall Health.`,
    '',
  ];
}
