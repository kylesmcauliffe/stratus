import hospitalContextJson from '@/data/hospital-external-context.json';
import systemContextJson from '@/data/system-external-context.json';

export type ExternalContextConfidence = 'high' | 'medium' | 'low';

export interface ExternalContextEntry {
  wikipediaTitle: string;
  wikipediaUrl: string;
  summary: string;
  wikidataId?: string;
  foundedYear?: number;
  ageYears?: number;
  website?: string;
  wikidataBeds?: number;
  wikidataEmployees?: number;
  confidence: ExternalContextConfidence;
  searchQuery?: string;
}

interface ContextFile {
  generatedAt: string | null;
  source: string;
  bySlug: Record<string, ExternalContextEntry>;
}

const hospitalStore = hospitalContextJson as ContextFile;
const systemStore = systemContextJson as ContextFile;

export const externalContextGeneratedAt = hospitalStore.generatedAt;
export const externalContextSource = hospitalStore.source;

export function getHospitalExternalContext(slug: string): ExternalContextEntry | undefined {
  return hospitalStore.bySlug[slug];
}

export function getSystemExternalContext(slug: string): ExternalContextEntry | undefined {
  return systemStore.bySlug[slug];
}

export function hasExternalContext(entry: ExternalContextEntry | undefined): entry is ExternalContextEntry {
  return Boolean(entry?.summary?.trim() || entry?.foundedYear || entry?.website);
}
