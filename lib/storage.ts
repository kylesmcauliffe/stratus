import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  watchlist: "stratus-watchlist",
  notes: "stratus-notes",
  conferenceLogs: "stratus-conference-logs",
  deckQueue: "stratus-deck-queue",
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getWatchlist(): Promise<string[]> {
  return readJson<string[]>(KEYS.watchlist, []);
}

export async function isWatchlisted(slug: string): Promise<boolean> {
  const list = await getWatchlist();
  return list.includes(slug);
}

export async function toggleWatchlist(slug: string): Promise<boolean> {
  const list = await getWatchlist();
  const has = list.includes(slug);
  const next = has ? list.filter((s) => s !== slug) : [...list, slug];
  await writeJson(KEYS.watchlist, next);
  return !has;
}

export interface HospitalNote {
  slug: string;
  text: string;
  updatedAt: string;
}

export async function getNotes(): Promise<Record<string, HospitalNote>> {
  return readJson<Record<string, HospitalNote>>(KEYS.notes, {});
}

export async function saveNote(slug: string, text: string): Promise<void> {
  const notes = await getNotes();
  notes[slug] = { slug, text, updatedAt: new Date().toISOString() };
  await writeJson(KEYS.notes, notes);
}

export interface ConferenceLog {
  id: string;
  hospitalSlug?: string;
  hospitalName?: string;
  contactName?: string;
  note: string;
  createdAt: string;
}

export async function getConferenceLogs(): Promise<ConferenceLog[]> {
  return readJson<ConferenceLog[]>(KEYS.conferenceLogs, []);
}

export async function addConferenceLog(input: Omit<ConferenceLog, "id" | "createdAt">): Promise<ConferenceLog> {
  const logs = await getConferenceLogs();
  const entry: ConferenceLog = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  await writeJson(KEYS.conferenceLogs, [entry, ...logs]);
  return entry;
}

export async function getDeckQueue(): Promise<string[]> {
  return readJson<string[]>(KEYS.deckQueue, []);
}

export async function setDeckQueue(slugs: string[]): Promise<void> {
  await writeJson(KEYS.deckQueue, slugs);
}
