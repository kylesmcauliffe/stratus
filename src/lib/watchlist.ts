const STORAGE_KEY = 'rainfall-hospital-watchlist';

export function getWatchlist(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export function isWatchlisted(slug: string): boolean {
  return getWatchlist().includes(slug);
}

export function toggleWatchlist(slug: string): boolean {
  const list = getWatchlist();
  const has = list.includes(slug);
  const next = has ? list.filter((s) => s !== slug) : [...list, slug];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return !has;
}
