import type { DirectoryHospital } from "@/src/lib/hospital-directory-record";
import { directoryHospitals } from "@/src/lib/directory-index";
import { buildBattleCard } from "@/lib/battle-card";
import { filterHospitals, type SearchFilters } from "@/lib/search";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  hospitals?: DirectoryHospital[];
  source?: "local" | "ai" | "fallback";
}

export interface HospitalBrief {
  slug: string;
  name: string;
  state: string;
  stars?: number | null;
  mspb?: number | null;
  rank?: number | null;
  outreach?: string | null;
  pipeline?: string | null;
  beds?: number | null;
  system?: string | null;
  flags?: string[];
}

function askApiUrl(): string {
  const base = process.env.EXPO_PUBLIC_ASK_API_URL?.replace(/\/$/, "");
  if (base) return `${base}/api/ask`;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api/ask`;
  }
  return "/api/ask";
}

function parseFilters(query: string): SearchFilters {
  const q = query.toLowerCase();
  const filters: SearchFilters = { sort: "cjr" };

  const stateMatch =
    q.match(/\b(in|from)\s+([a-z]{2})\b/) ||
    q.match(/\b([a-z]{2})\b(?=.*\b(hospital|state|team)\b)/);
  if (stateMatch) filters.state = stateMatch[stateMatch.length - 1].toUpperCase();

  if (q.includes("top 50") || q.includes("top fifty") || q.includes("cjr top")) filters.cjrTop50 = true;
  if (q.includes("no outreach") || q.includes("without outreach") || q.includes("greenfield"))
    filters.outreach = "No";
  if (q.includes("5 star") || q.includes("five star")) filters.stars = 5;
  if (q.includes("demo") || q.includes("pipeline")) filters.pipeline = "Demo";
  if (q.includes("active pipeline")) filters.pipeline = "Active";

  const words = query.replace(/[^\w\s]/g, " ").trim();
  if (words.length > 2 && !filters.state) filters.q = words;

  return filters;
}

function filterHacrp(list: DirectoryHospital[]): DirectoryHospital[] {
  return list.filter((h) => h.hacrpPenalty);
}

function filterHighMspb(list: DirectoryHospital[]): DirectoryHospital[] {
  return list.filter((h) => h.mspbScore != null && h.mspbScore > 1.05);
}

function toBrief(h: DirectoryHospital): HospitalBrief {
  return {
    slug: h.slug,
    name: h.name,
    state: h.state,
    stars: h.overallRating,
    mspb: h.mspbScore,
    rank: h.teamRankByCjr,
    outreach: h.outreachStatus,
    pipeline: h.pipelineStatus,
    beds: h.beds,
    system: h.healthSystem,
    flags: buildBattleCard(h).flags,
  };
}

function narrative(query: string, hospitals: DirectoryHospital[]): string {
  const q = query.toLowerCase();
  if (hospitals.length === 0) {
    return "I couldn't find hospitals matching that. Try a state code (e.g. TX), system name, or filters like “top 50 CJR” or “no outreach”.";
  }

  const top = hospitals.slice(0, 5);
  const lines = top.map((h) => {
    const card = buildBattleCard(h);
    return `• **${h.name}** (${h.state}) — ${card.metrics
      .slice(0, 3)
      .map((m) => `${m.label}: ${m.value}`)
      .join(" · ")}`;
  });

  let intro = `Found **${hospitals.length}** TEAM hospitals`;
  if (q.includes("hacrp")) intro += " with HACRP penalties";
  if (q.includes("mspb")) intro += " with elevated MSPB";
  if (q.includes("conference") || q.includes("pitch")) intro += " worth prepping for your next conversation";

  intro += ". Top matches:\n\n" + lines.join("\n");

  if (hospitals.length > 5) {
    intro += `\n\nOpen **Home** or **Compare** to explore all ${hospitals.length} matches.`;
  }

  return intro;
}

export function askAssistantLocal(query: string): ChatMessage {
  const filters = parseFilters(query);
  let hospitals = filterHospitals(filters);
  const q = query.toLowerCase();

  if (q.includes("hacrp") || q.includes("penalty")) hospitals = filterHacrp(hospitals);
  if (q.includes("high mspb") || q.includes("efficiency")) hospitals = filterHighMspb(hospitals);

  if (q.includes("how many")) {
    return {
      id: `${Date.now()}`,
      role: "assistant",
      text: `There are **${directoryHospitals.length}** hospitals in the TEAM roster. Your query matches **${hospitals.length}**.`,
      hospitals: hospitals.slice(0, 8),
      source: "local",
    };
  }

  if (q.includes("help") || q.includes("what can")) {
    return {
      id: `${Date.now()}`,
      role: "assistant",
      text:
        "Ask me things like:\n\n• “Hospitals in TX with no outreach”\n• “Top 50 CJR in California”\n• “5 star hospitals with HACRP penalty”\n• “High MSPB in the Midwest”\n• “How many TEAM hospitals?”\n\nI'll surface matches you can open as battle cards.",
      source: "local",
    };
  }

  return {
    id: `${Date.now()}`,
    role: "assistant",
    text: narrative(query, hospitals),
    hospitals: hospitals.slice(0, 8),
    source: "local",
  };
}

/** @deprecated use askAssistant */
export function askAssistant(query: string): ChatMessage {
  return askAssistantLocal(query);
}

export async function askAssistantAsync(query: string): Promise<ChatMessage> {
  const local = askAssistantLocal(query);
  const q = query.toLowerCase();

  if (q.includes("help") || q.includes("what can") || q.includes("how many")) {
    return local;
  }

  const hospitals = local.hospitals ?? [];
  const matchCount = filterHospitals(parseFilters(query)).length;

  try {
    const res = await fetch(askApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        matchCount,
        hospitals: hospitals.map(toBrief),
      }),
    });

    if (res.ok) {
      const data = (await res.json()) as { text?: string; source?: string };
      if (data.text) {
        return {
          ...local,
          text: data.text,
          source: data.source === "ai" ? "ai" : "fallback",
        };
      }
    }
  } catch {
    /* offline / local dev — use rule-based reply */
  }

  return local;
}

export const STARTER_PROMPTS = [
  "Top 50 CJR hospitals with no outreach",
  "5 star hospitals in TX",
  "HACRP penalty hospitals in NY",
  "Who should I prioritize at a conference in Florida?",
];
