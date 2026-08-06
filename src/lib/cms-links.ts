/** External CMS / Medicare links (no API keys). */

export function normalizeCcn(ccn: string): string {
  return ccn.replace(/\D/g, '').padStart(6, '0');
}

/** Medicare Care Compare hospital search by CCN. */
export function careCompareSearchUrl(ccn: string): string {
  const id = normalizeCcn(ccn);
  const params = new URLSearchParams({
    providerType: 'Hospital',
    searchType: '3',
    searchTerm: id,
  });
  return `https://www.medicare.gov/care-compare/?${params.toString()}`;
}

/** CMS Provider Data Catalog — Hospital General Information dataset. */
export const CMS_HOSPITAL_GENERAL_DATASET_URL =
  'https://data.cms.gov/provider-data/dataset/xubh-q36u';
