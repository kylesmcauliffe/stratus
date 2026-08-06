import { normalizeStateCode, regionProfilePath } from '@/lib/directory-links';

export function regionStateProfilePath(regionSlug: string, state: string): string {
  return `${regionProfilePath(regionSlug)}/states/${normalizeStateCode(state)}`;
}
