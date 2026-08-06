import { teamHospitals, TEAM_MANDATED_HOSPITAL_COUNT } from '@/data/team-hospitals';
import { hospitalProfilePath } from '@/lib/hospital-slug';
import { hospitalDisplayName } from '@/lib/team-hospital-links';

export type PageGroup = 'Directory';

export interface IndexedPage {
  path: string;
  title: string;
  summary: string;
  group: PageGroup;
}

const n = TEAM_MANDATED_HOSPITAL_COUNT;

/** Directory tool pages (excludes per-hospital profiles from llms page list). */
export const coreIndexedPages: IndexedPage[] = [
  {
    path: '/',
    title: 'Hospital Directory',
    summary: `Searchable directory of ${n} CMS TEAM mandated hospitals by name and state.`,
    group: 'Directory',
  },
  {
    path: '/states',
    title: 'States',
    summary:
      'TEAM hospital rollups by state, Rainfall region, and health system, plus an interactive US map.',
    group: 'Directory',
  },
  {
    path: '/compare',
    title: 'Compare hospitals',
    summary: 'Side-by-side comparison of up to three TEAM hospitals.',
    group: 'Directory',
  },
];

export const hospitalIndexedPages: IndexedPage[] = teamHospitals.map((hospital) => {
  const display = hospitalDisplayName(hospital.name);
  const location = hospital.city ? `${hospital.city}, ${hospital.state}` : hospital.state;
  return {
    path: hospitalProfilePath(hospital.slug),
    title: `${display} — CMS TEAM Hospital`,
    summary: `${display} (${location}) on the CMS TEAM mandated hospital list.`,
    group: 'Directory',
  };
});

export const indexedPages: IndexedPage[] = [...coreIndexedPages, ...hospitalIndexedPages];

export function isHospitalProfilePath(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return normalized.startsWith('/hospitals/') && normalized !== '/hospitals';
}

export const pageGroups: PageGroup[] = ['Directory'];

export function findIndexedPage(pathname: string): IndexedPage | undefined {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return indexedPages.find((p) => p.path === normalized);
}

export function ogSlugForPath(pathname: string): string {
  const trimmed = pathname.replace(/^\/|\/$/g, '');
  return trimmed === '' ? 'index' : trimmed;
}
