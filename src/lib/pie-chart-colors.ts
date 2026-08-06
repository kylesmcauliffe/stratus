const PIE_FALLBACK_COLORS = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#dc2626',
  '#0891b2',
  '#64748b',
] as const;

export const PIE_LABEL_COLORS: Record<string, string> = {
  Urban: '#2563eb',
  Rural: '#059669',
  Unknown: '#94a3b8',
  'Non-profit': '#0ea5e9',
  Proprietary: '#d97706',
  Gov: '#334155',
  Other: '#8b5cf6',
  'Top 50': '#2563eb',
  '51–150': '#38bdf8',
  '151–350': '#fbbf24',
  '351+': '#94a3b8',
  '5★': '#059669',
  '4★': '#38bdf8',
  '3★': '#fbbf24',
  '1–2★': '#f97316',
  Unrated: '#cbd5e1',
};

export function pieColorForLabel(label: string, index: number): string {
  return PIE_LABEL_COLORS[label] ?? PIE_FALLBACK_COLORS[index % PIE_FALLBACK_COLORS.length]!;
}

/** Readable label on filled slice. */
export function pieLabelTextFill(hex: string): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return '#0f172a';
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#0f172a' : '#ffffff';
}
