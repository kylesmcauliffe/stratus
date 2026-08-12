import type { DirectoryHospital } from "@/src/lib/hospital-directory-record";
import { directoryHospitals } from "@/src/lib/directory-index";

export type SortKey = "relevance" | "cjr" | "stars" | "beds" | "mspb" | "tcv" | "name";

export interface SearchFilters {
  q?: string;
  state?: string;
  region?: string;
  stars?: number;
  outreach?: string;
  pipeline?: string;
  cjrTop50?: boolean;
  sort?: SortKey;
}

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

function matchesQuery(h: DirectoryHospital, q: string): boolean {
  const needle = normalizeQuery(q);
  if (!needle) return true;
  const hay = [h.name, h.city, h.state, h.healthSystem, h.region, h.ccn]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

export function filterHospitals(filters: SearchFilters): DirectoryHospital[] {
  let list = [...directoryHospitals];

  if (filters.q) list = list.filter((h) => matchesQuery(h, filters.q!));
  if (filters.state) list = list.filter((h) => h.state === filters.state);
  if (filters.region) list = list.filter((h) => h.region === filters.region);
  if (filters.stars != null) list = list.filter((h) => (h.overallRating ?? 0) >= filters.stars!);
  if (filters.outreach) list = list.filter((h) => h.outreachStatus === filters.outreach);
  if (filters.pipeline) list = list.filter((h) => h.pipelineStatus === filters.pipeline);
  if (filters.cjrTop50) list = list.filter((h) => h.cjrTop50 === true);

  const sort = filters.sort ?? "relevance";
  list.sort((a, b) => {
    switch (sort) {
      case "cjr":
        return (a.teamRankByCjr ?? 9999) - (b.teamRankByCjr ?? 9999);
      case "stars":
        return (b.overallRating ?? 0) - (a.overallRating ?? 0);
      case "beds":
        return (b.beds ?? 0) - (a.beds ?? 0);
      case "mspb":
        return (a.mspbScore ?? 99) - (b.mspbScore ?? 99);
      case "tcv":
        return (b.estTcv ?? 0) - (a.estTcv ?? 0);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return (a.teamRankByCjr ?? 9999) - (b.teamRankByCjr ?? 9999);
    }
  });

  return list;
}

export function getFilterChips(): { label: string; filters: Partial<SearchFilters> }[] {
  return [
    { label: "Top 50 CJR", filters: { cjrTop50: true, sort: "cjr" } },
    { label: "No outreach", filters: { outreach: "No", sort: "cjr" } },
    { label: "5 stars", filters: { stars: 5, sort: "stars" } },
    { label: "Active pipeline", filters: { pipeline: "Active", sort: "tcv" } },
    { label: "Demo stage", filters: { pipeline: "Demo", sort: "cjr" } },
  ];
}

export function uniqueStates(): string[] {
  return [...new Set(directoryHospitals.map((h) => h.state))].sort();
}

export function uniqueRegions(): string[] {
  return [...new Set(directoryHospitals.map((h) => h.region).filter(Boolean) as string[])].sort();
}
