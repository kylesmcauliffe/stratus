import { systemSlugFromName } from '@/lib/hospital-directory-record';
import { regionSlugFromName } from '@/lib/region-rollups';
import {
  HOSPITAL_SEARCH_QUERY_CJR_TOP50,
  HOSPITAL_SEARCH_QUERY_MAX_CJR,
  HOSPITAL_SEARCH_QUERY_OUTREACH,
  HOSPITAL_SEARCH_QUERY_OWNERSHIP,
  HOSPITAL_SEARCH_QUERY_OWNERSHIP_BUCKET,
  HOSPITAL_SEARCH_QUERY_PIPELINE,
  HOSPITAL_SEARCH_QUERY_REGION,
  HOSPITAL_SEARCH_QUERY_RURAL,
  HOSPITAL_SEARCH_QUERY_SORT,
  HOSPITAL_SEARCH_QUERY_STARS,
  HOSPITAL_SEARCH_QUERY_STATE,
  HOSPITAL_SEARCH_QUERY_SYSTEM,
} from '@/lib/hospital-search';

/** Shared class for in-app entity links (tables, chips, facts). */
export const DIR_ENTITY_LINK_CLASS = 'dir-entity-link';

export function normalizeStateCode(state: string): string {
  return state.trim().toUpperCase();
}

export function statesIndexPath(): string {
  return '/states';
}

/** Collapsible rollup / graphs section on `/states` (hash opens + scrolls via GeographyExplore). */
export type StatesGeographySectionId =
  | 'graphs'
  | 'rollups'
  | 'regions'
  | 'systems'
  | 'states'
  | 'rural-urban'
  | 'ownership';

export function statesGeographySectionUrl(section: StatesGeographySectionId): string {
  return `/states#${section}`;
}

export function stateProfilePath(state: string): string {
  return `/states/${normalizeStateCode(state)}`;
}

export function systemProfilePath(slug: string): string {
  return `/systems/${slug}`;
}

export function systemProfilePathFromName(systemName: string): string {
  return systemProfilePath(systemSlugFromName(systemName));
}

export function regionProfilePath(slug: string): string {
  return `/regions/${slug}`;
}

export function regionProfilePathFromName(regionName: string): string {
  return regionProfilePath(regionSlugFromName(regionName));
}

function directorySearchUrl(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') sp.set(key, value);
  }
  const q = sp.toString();
  return q ? `/?${q}#search` : '/';
}

/** Filter home roster to hospitals in an ownership bucket (Non-profit, Gov, etc.). */
export function directoryFilterOwnershipBucketUrl(
  bucket: 'Non-profit' | 'Proprietary' | 'Gov' | 'Other' | 'Unknown',
): string {
  return directorySearchUrl({
    [HOSPITAL_SEARCH_QUERY_OWNERSHIP_BUCKET]: bucket,
    [HOSPITAL_SEARCH_QUERY_SORT]: 'cjr',
  });
}

export function directoryFilterStateUrl(
  state: string,
  extra?: Record<string, string | undefined>,
): string {
  return directorySearchUrl({
    [HOSPITAL_SEARCH_QUERY_STATE]: normalizeStateCode(state),
    [HOSPITAL_SEARCH_QUERY_SORT]: 'cjr',
    ...extra,
  });
}

export function directoryFilterSystemUrl(systemName: string): string {
  return directorySearchUrl({
    [HOSPITAL_SEARCH_QUERY_SYSTEM]: systemName,
    [HOSPITAL_SEARCH_QUERY_SORT]: 'cjr',
  });
}

export function directoryFilterRegionUrl(regionName: string): string {
  return directorySearchUrl({
    [HOSPITAL_SEARCH_QUERY_REGION]: regionName,
    [HOSPITAL_SEARCH_QUERY_SORT]: 'cjr',
  });
}

export function directoryFilterPipelineUrl(pipelineStatus: string, state?: string): string {
  return directorySearchUrl({
    [HOSPITAL_SEARCH_QUERY_PIPELINE]: pipelineStatus,
    [HOSPITAL_SEARCH_QUERY_SORT]: 'cjr',
    ...(state ? { [HOSPITAL_SEARCH_QUERY_STATE]: normalizeStateCode(state) } : {}),
  });
}

export function directoryFilterOutreachUrl(outreachStatus: string, state?: string): string {
  return directorySearchUrl({
    [HOSPITAL_SEARCH_QUERY_OUTREACH]: outreachStatus,
    [HOSPITAL_SEARCH_QUERY_SORT]: 'cjr',
    ...(state ? { [HOSPITAL_SEARCH_QUERY_STATE]: normalizeStateCode(state) } : {}),
  });
}

export function directoryFilterRuralUrl(code: 'R' | 'U', state?: string): string {
  return directorySearchUrl({
    [HOSPITAL_SEARCH_QUERY_RURAL]: code,
    [HOSPITAL_SEARCH_QUERY_SORT]: 'cjr',
    ...(state ? { [HOSPITAL_SEARCH_QUERY_STATE]: normalizeStateCode(state) } : {}),
  });
}

export function directoryFilterOwnershipUrl(ownershipMatch: string, state?: string): string {
  return directorySearchUrl({
    [HOSPITAL_SEARCH_QUERY_OWNERSHIP]: ownershipMatch,
    [HOSPITAL_SEARCH_QUERY_SORT]: 'cjr',
    ...(state ? { [HOSPITAL_SEARCH_QUERY_STATE]: normalizeStateCode(state) } : {}),
  });
}

export function directoryFilterMaxCjrUrl(maxRank: number, state?: string): string {
  return directorySearchUrl({
    [HOSPITAL_SEARCH_QUERY_MAX_CJR]: String(maxRank),
    [HOSPITAL_SEARCH_QUERY_SORT]: 'cjr',
    ...(state ? { [HOSPITAL_SEARCH_QUERY_STATE]: normalizeStateCode(state) } : {}),
  });
}

export function directoryFilterCjrTop50Url(state?: string): string {
  return directorySearchUrl({
    [HOSPITAL_SEARCH_QUERY_CJR_TOP50]: '1',
    [HOSPITAL_SEARCH_QUERY_SORT]: 'cjr',
    ...(state ? { [HOSPITAL_SEARCH_QUERY_STATE]: normalizeStateCode(state) } : {}),
  });
}

export function directoryFilterStarsMinUrl(starsMin: number, state?: string): string {
  return directorySearchUrl({
    [HOSPITAL_SEARCH_QUERY_STARS]: String(starsMin),
    [HOSPITAL_SEARCH_QUERY_SORT]: 'stars',
    ...(state ? { [HOSPITAL_SEARCH_QUERY_STATE]: normalizeStateCode(state) } : {}),
  });
}

/** CJR distribution bin → home roster filtered by max rank (upper bound of bucket). */
export function directoryFilterCjrBinUrl(binLabel: string, state?: string): string | undefined {
  if (binLabel === 'Top 50') return directoryFilterMaxCjrUrl(50, state);
  if (binLabel === '51–150') return directoryFilterMaxCjrUrl(150, state);
  if (binLabel === '151–350') return directoryFilterMaxCjrUrl(350, state);
  if (binLabel === '351+') return undefined;
  return undefined;
}

/** HTML anchor for client-rendered tables (escape href + label). */
export function entityLinkHtml(
  href: string,
  label: string,
  escapeHtml: (s: string) => string,
  className = DIR_ENTITY_LINK_CLASS,
): string {
  return `<a href="${escapeHtml(href)}" class="${className} font-semibold hover:underline">${escapeHtml(label)}</a>`;
}

/** State code link to `/states/[ST]` (home hospital list ST column). */
export function stateProfileLinkHtml(
  state: string,
  escapeHtml: (s: string) => string,
  className = DIR_ENTITY_LINK_CLASS,
): string {
  const code = normalizeStateCode(state);
  if (!code) return '—';
  return `<a href="${escapeHtml(stateProfilePath(code))}" class="${className} font-semibold hover:underline" title="${escapeHtml(`View ${code} state profile`)}" data-state-profile="${escapeHtml(code)}">${escapeHtml(code)}</a>`;
}
