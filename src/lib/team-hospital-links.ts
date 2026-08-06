/** Display title case for map/search queries (matches hospital list UI). */
export function hospitalDisplayName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Opens the hospital in Google Maps — no curated URL list required; avoids broken links.
 * Query uses facility name + state from the CMS TEAM roster.
 */
export function hospitalMapsSearchUrl(name: string, state: string): string {
  const query = `${hospitalDisplayName(name)}, ${state}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const CMS_TEAM_HOSPITAL_LIST_URL =
  'https://www.cms.gov/priorities/innovation/innovation-models/team-model';
