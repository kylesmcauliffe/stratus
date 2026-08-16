import type { DirectoryHospital } from "@/src/lib/hospital-directory-record";
import { directoryHospitals } from "@/src/lib/directory-index";
import { buildBattleCard } from "@/lib/battle-card";
import { TEAM_MANDATED_HOSPITAL_COUNT } from "@/src/data/team-hospitals";

export interface InsightStat {
  label: string;
  value: string;
}

export interface NationalBriefing {
  headline: string;
  body: string;
  stats: InsightStat[];
}

export function nationalBriefing(): NationalBriefing {
  const total = directoryHospitals.length || TEAM_MANDATED_HOSPITAL_COUNT;
  const noOutreach = directoryHospitals.filter((h) => h.outreachStatus === "No").length;
  const top50 = directoryHospitals.filter((h) => h.cjrTop50 || (h.teamRankByCjr ?? 999) <= 50);
  const top50Open = top50.filter((h) => h.outreachStatus === "No").length;
  const fiveStar = directoryHospitals.filter((h) => (h.overallRating ?? 0) >= 5).length;
  const hacrp = directoryHospitals.filter((h) => h.hacrpPenalty).length;

  const byState = new Map<string, number>();
  for (const h of directoryHospitals) {
    byState.set(h.state, (byState.get(h.state) ?? 0) + 1);
  }
  const densest = [...byState.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return {
    headline: `${top50Open} of the CJR top 50 still have no Rainfall outreach`,
    body: `${densest.map(([st, n]) => `${st} (${n})`).join(", ")} hold the densest TEAM footprint. ${hacrp} sites carry a HACRP penalty — a timely quality conversation.`,
    stats: [
      { label: "TEAM sites", value: String(total) },
      { label: "No outreach", value: String(noOutreach) },
      { label: "5-star", value: String(fiveStar) },
      { label: "HACRP", value: String(hacrp) },
    ],
  };
}

export function hospitalInsight(h: DirectoryHospital): string {
  const card = buildBattleCard(h);
  if (card.takeaways[0]?.body) return card.takeaways[0].body;
  const rank = h.teamRankByCjr != null ? `CJR #${h.teamRankByCjr}` : "unranked on CJR";
  const stars = h.overallRating != null ? `${h.overallRating} CMS stars` : "star rating pending";
  return `${h.name} is ${rank} with ${stars}. ${h.outreachStatus === "No" ? "No outreach logged yet." : "Outreach is already in motion."}`;
}

export function queryInsight(query: string, hospitals: DirectoryHospital[], matchCount: number): string {
  if (!hospitals.length) {
    return `No TEAM hospitals matched “${query}”. Try a state code (TX), “top 50 CJR”, or “no outreach”.`;
  }
  const sample = hospitals.slice(0, 3);
  const names = sample.map((h) => h.name.replace(/\b(HOSPITAL|MEDICAL CENTER|HEALTH)\b/gi, "").trim()).join("; ");
  const greenfield = hospitals.filter((h) => h.outreachStatus === "No").length;
  const next = sample[0];
  const nextLine = next
    ? `Start with ${next.name} (${next.state}${next.teamRankByCjr != null ? `, CJR #${next.teamRankByCjr}` : ""}).`
    : "";
  return `${matchCount} hospitals fit this search. ${greenfield} still have no outreach. Lead list: ${names}. ${nextLine}`;
}

export function smallTalkReply(): string {
  const brief = nationalBriefing();
  return `Stratus is ready. ${brief.headline}. Ask who to see in a state, which top-50 sites are still greenfield, or where HACRP risk lines up with no outreach — I’ll brief you like a field prep, not a spreadsheet.`;
}
