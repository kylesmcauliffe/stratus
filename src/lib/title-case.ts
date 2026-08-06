/** Acronyms and product terms that stay uppercase in UI labels. */
const PRESERVE_UPPER = new Set([
  'TEAM',
  'CMS',
  'RAIN',
  'BPCI',
  'CJR',
  'IPPS',
  'EHR',
  'SOC',
  'CFO',
  'CEO',
  'CMIO',
  'CQS',
  'CBSA',
  'CABG',
  'LEJR',
  'SHFFT',
  'FHIR',
  'ADT',
  'JWKS',
  'API',
  'PDF',
  'XLSX',
  'FAQS',
  'FAQ',
  'PTO',
  'JWKS',
  'VS',
  'MSA',
  'MDH',
  'SCH',
  'EACH',
  'THA',
  'TKA',
  'PRO',
  'PM',
  'PSI',
]);

function capitalizeCore(core: string): string {
  const upper = core.toUpperCase();
  if (PRESERVE_UPPER.has(upper)) return upper;

  if (core.includes('-')) {
    return core.split('-').map((part) => capitalizeCore(part)).join('-');
  }

  return core.charAt(0).toUpperCase() + core.slice(1).toLowerCase();
}

function capitalizeWord(word: string): string {
  const match = word.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9'-]+)(.*)$/);
  if (!match) return word;
  const [, lead, core, trail] = match;
  return lead + capitalizeCore(core) + trail;
}

/** Title-case for short UI labels: headings, buttons, stat captions. */
export function uiTitleCase(text: string): string {
  return text.replace(/\S+/g, capitalizeWord);
}
