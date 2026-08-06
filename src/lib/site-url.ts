/**
 * Canonical site origin for SEO, JSON-LD, llms.txt, and sitemap.
 * Production: default https://www.rainfallhealth.com
 * Staging preview: SITE=https://rainfall-aeo.netlify.app npm run build
 */
export function getSiteUrl(): string {
  const fromEnv = import.meta.env.SITE;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv.replace(/\/$/, '');
  }
  return 'https://www.rainfallhealth.com';
}

/** @deprecated Use getSiteUrl() — avoids stale module-level origin when SITE env changes. */
export const SITE_URL = getSiteUrl();

export function absoluteUrl(path: string): string {
  return new URL(path, `${getSiteUrl()}/`).toString();
}
