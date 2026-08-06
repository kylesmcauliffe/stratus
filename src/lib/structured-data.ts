import type {
  Organization,
  WebSite,
  BreadcrumbList,
  WithContext,
  Dataset,
  Hospital,
  Thing,
} from 'schema-dts';
import type { TeamHospital } from '@/data/team-hospitals';
import { hospitalDisplayName } from '@/lib/team-hospital-links';
import { hospitalProfilePath } from '@/lib/hospital-slug';
import { siteConfig } from '@/data/site-config';
import { findIndexedPage } from '@/data/page-index';
import { TEAM_MANDATED_HOSPITAL_COUNT } from '@/data/team-hospitals';
import { getSiteUrl, absoluteUrl as abs } from '@/lib/site-url';

export { getSiteUrl, abs as absoluteUrl };

function logoUrl(): string {
  return `${getSiteUrl()}/favicon.svg`;
}

export function organization(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: getSiteUrl(),
    logo: logoUrl(),
    email: siteConfig.email,
    description: siteConfig.description,
  };
}

export function website(): WithContext<WebSite> {
  const origin = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: origin,
    description: siteConfig.description,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: origin,
    },
    inLanguage: 'en-US',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${origin}/?q={search_term_string}`,
      },
    },
  };
}

export function breadcrumb(pathname: string): WithContext<BreadcrumbList> | null {
  const segments = pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .filter(Boolean);
  if (segments.length < 2) return null;

  const items = [
    {
      '@type': 'ListItem' as const,
      position: 1,
      name: 'Home',
      item: abs('/'),
    },
    ...segments.map((seg, i) => {
      const path = '/' + segments.slice(0, i + 1).join('/');
      const indexed = findIndexedPage(path);
      const name =
        indexed?.title.split(' — ')[0].split(' | ')[0] ??
        seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        '@type': 'ListItem' as const,
        position: i + 2,
        name,
        item: abs(path),
      };
    }),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function teamHospitalProfile(hospital: TeamHospital): WithContext<Hospital> {
  const path = hospitalProfilePath(hospital.slug);
  const url = abs(path);
  const name = hospitalDisplayName(hospital.name);
  const node: WithContext<Hospital> = {
    '@context': 'https://schema.org',
    '@type': 'Hospital',
    name,
    url,
    description: `${name} (${hospital.state}) is listed on the CMS TEAM mandated hospital participant roster.`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    address: {
      '@type': 'PostalAddress',
      addressRegion: hospital.state,
      addressCountry: 'US',
      ...(hospital.city ? { addressLocality: hospital.city } : {}),
    },
  };
  if (hospital.healthSystem) {
    node.parentOrganization = {
      '@type': 'Organization',
      name: hospital.healthSystem,
    };
  }
  return node;
}

export interface HospitalDatasetInput {
  count: number;
  path: string;
  lastUpdated?: string;
}

export function teamHospitalsDataset(input: HospitalDatasetInput): WithContext<Dataset> {
  const url = abs(input.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'CMS TEAM Mandated Hospitals',
    alternateName: ['TEAM Participating Hospitals', `${TEAM_MANDATED_HOSPITAL_COUNT} TEAM Hospitals`],
    description: `Searchable list of the ${input.count} acute-care hospitals mandated to participate in the CMS Transforming Episode Accountability Model (TEAM), with hospital name and state. Sourced from CMS's official TEAM participant list.`,
    url,
    keywords: [
      'CMS TEAM',
      'Transforming Episode Accountability Model',
      'TEAM participating hospitals',
      'Medicare bundled payment',
    ],
    isAccessibleForFree: true,
    license: 'https://www.cms.gov/about-cms/web-policies-important-links',
    creator: { '@type': 'Organization', name: 'Centers for Medicare & Medicaid Services' },
    publisher: { '@type': 'Organization', name: siteConfig.name, url: getSiteUrl() },
    inLanguage: 'en-US',
    dateModified: input.lastUpdated,
  };
}

export type AnySchema = WithContext<Thing>;
