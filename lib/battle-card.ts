import type { DirectoryHospital } from "@/src/lib/hospital-directory-record";
import {
  compareToBenchmark,
  researchBenchmarks,
  stateBenchmarks,
} from "@/src/lib/research-benchmarks";
import { TEAM_MANDATED_HOSPITAL_COUNT } from "@/src/data/team-hospitals";

export type BattleCardTone = "good" | "warn" | "neutral";

export interface BattleCardMetric {
  label: string;
  value: string;
  detail: string | null;
  tone: BattleCardTone;
}

export interface BattleCardTakeaway {
  title: string;
  body: string;
  tone: BattleCardTone;
}

export interface BattleCard {
  slug: string;
  name: string;
  state: string;
  city?: string;
  healthSystem?: string;
  region?: string;
  headline: string;
  pitch: string;
  metrics: BattleCardMetric[];
  takeaways: BattleCardTakeaway[];
  flags: string[];
  outreachStatus?: string;
  pipelineStatus?: string;
  salesStage?: string;
  estTcv?: number | null;
  teamRankByCjr?: number | null;
  cjrTop50?: boolean | null;
}

function toneFromCompare(tone: "good" | "warn" | "neutral" | undefined): BattleCardTone {
  return tone ?? "neutral";
}

function buildFlags(h: DirectoryHospital): string[] {
  const flags: string[] = [];
  if (h.hacrpPenalty) flags.push("HACRP penalty");
  if ((h.overallRating ?? 5) <= 3) flags.push("Low CMS stars");
  if (h.outreachStatus === "No") flags.push("No outreach yet");
  if (h.cjrTop50) flags.push("CJR top 50");
  if ((h.teamRankByCjr ?? 999) <= 50) flags.push("High priority");
  if (h.mspbScore != null && h.mspbScore > 1.08) flags.push("High MSPB");
  return flags;
}

function buildPitch(h: DirectoryHospital): string {
  const stars = h.overallRating != null ? `${h.overallRating} CMS stars` : "CMS data pending";
  const rank =
    h.teamRankByCjr != null
      ? `Rainfall CJR rank #${h.teamRankByCjr} of ${TEAM_MANDATED_HOSPITAL_COUNT}`
      : "CJR rank pending";
  const outreach = h.outreachStatus ? `${h.outreachStatus} outreach` : "Outreach unknown";
  return `${h.name} · ${stars} · ${rank} · ${outreach}.`;
}

export function buildBattleCard(h: DirectoryHospital): BattleCard {
  const stateBench = stateBenchmarks[h.state];
  const metrics: BattleCardMetric[] = [
    {
      label: "CMS stars",
      value: h.overallRating != null ? `${h.overallRating}/5` : "—",
      detail:
        compareToBenchmark({
          value: h.overallRating,
          benchmark: stateBench?.medianStars ?? researchBenchmarks.medianStars,
          metric: "CMS stars",
          peerLabel: `${h.state} median`,
        })?.detail ?? null,
      tone: toneFromCompare(
        compareToBenchmark({
          value: h.overallRating,
          benchmark: stateBench?.medianStars ?? researchBenchmarks.medianStars,
          metric: "CMS stars",
          peerLabel: `${h.state} median`,
        })?.tone,
      ),
    },
    {
      label: "MSPB index",
      value: h.mspbScore != null ? h.mspbScore.toFixed(2) : "—",
      detail:
        compareToBenchmark({
          value: h.mspbScore,
          benchmark: stateBench?.medianMspb ?? researchBenchmarks.medianMspb,
          lowerIsBetter: true,
          metric: "MSPB",
          peerLabel: `${h.state} median`,
          format: (n) => n.toFixed(2),
        })?.detail ?? null,
      tone: toneFromCompare(
        compareToBenchmark({
          value: h.mspbScore,
          benchmark: stateBench?.medianMspb ?? researchBenchmarks.medianMspb,
          lowerIsBetter: true,
          metric: "MSPB",
          peerLabel: `${h.state} median`,
        })?.tone,
      ),
    },
    {
      label: "HVBP score",
      value: h.hvbpTps != null ? String(Math.round(h.hvbpTps)) : "—",
      detail:
        compareToBenchmark({
          value: h.hvbpTps,
          benchmark: stateBench?.medianHvbpTps ?? researchBenchmarks.medianHvbpTps,
          metric: "HVBP",
          peerLabel: `${h.state} median`,
          format: (n) => String(Math.round(n)),
        })?.detail ?? null,
      tone: toneFromCompare(
        compareToBenchmark({
          value: h.hvbpTps,
          benchmark: stateBench?.medianHvbpTps ?? researchBenchmarks.medianHvbpTps,
          metric: "HVBP",
          peerLabel: `${h.state} median`,
        })?.tone,
      ),
    },
    {
      label: "Licensed beds",
      value: h.beds != null ? h.beds.toLocaleString("en-US") : "—",
      detail:
        compareToBenchmark({
          value: h.beds,
          benchmark: stateBench?.medianBeds ?? researchBenchmarks.medianBeds,
          metric: "Beds",
          peerLabel: `${h.state} median`,
          format: (n) => n.toLocaleString("en-US"),
        })?.detail ?? null,
      tone: "neutral",
    },
    {
      label: "CJR rank",
      value: h.teamRankByCjr != null ? `#${h.teamRankByCjr}` : "—",
      detail:
        h.teamRankByCjr != null
          ? `Top ${Math.round(((TEAM_MANDATED_HOSPITAL_COUNT - h.teamRankByCjr + 1) / TEAM_MANDATED_HOSPITAL_COUNT) * 100)}% of TEAM cohort`
          : null,
      tone:
        h.teamRankByCjr != null && h.teamRankByCjr <= 50
          ? "good"
          : h.teamRankByCjr != null && h.teamRankByCjr > 300
            ? "warn"
            : "neutral",
    },
    {
      label: "Est. TCV",
      value: h.estTcv != null ? `$${(h.estTcv / 1_000_000).toFixed(1)}M` : "—",
      detail: h.pipelineStatus ? `Pipeline: ${h.pipelineStatus}` : null,
      tone: h.estTcv != null && h.estTcv >= 1_500_000 ? "good" : "neutral",
    },
  ];

  if (h.population != null || h.medianIncome != null) {
    metrics.push({
      label: "County pop.",
      value: h.population != null ? h.population.toLocaleString("en-US") : "—",
      detail: h.county ? `${h.county} County` : null,
      tone: "neutral",
    });
    metrics.push({
      label: "County income",
      value: h.medianIncome != null ? `$${Math.round(h.medianIncome / 1000)}k median` : "—",
      detail: "ACS 5-year estimate",
      tone: "neutral",
    });
  } else if (h.cbsaPopulation != null || h.cbsaMedianIncome != null) {
    metrics.push({
      label: "CBSA pop.",
      value: h.cbsaPopulation != null ? h.cbsaPopulation.toLocaleString("en-US") : "—",
      detail: h.cbsaName ?? "Metro area",
      tone: "neutral",
    });
    metrics.push({
      label: "CBSA income",
      value: h.cbsaMedianIncome != null ? `$${Math.round(h.cbsaMedianIncome / 1000)}k median` : "—",
      detail: "ACS 5-year (metro proxy)",
      tone: "neutral",
    });
  }

  const takeaways: BattleCardTakeaway[] = [];

  if (h.hacrpPenalty) {
    takeaways.push({
      title: "Payment risk",
      body: "Hospital carries a 1% Medicare HACRP payment reduction — efficiency and quality improvement are timely talking points.",
      tone: "warn",
    });
  }

  if ((h.overallRating ?? 5) <= 3) {
    takeaways.push({
      title: "Quality gap",
      body: "CMS overall star rating is below peer average. TEAM episodes are a lever for measurable improvement.",
      tone: "warn",
    });
  }

  if (h.outreachStatus === "No") {
    takeaways.push({
      title: "Greenfield account",
      body: "No Rainfall outreach logged yet — strong candidate for first conversation at events.",
      tone: "good",
    });
  }

  if (h.cjrTop50 || (h.teamRankByCjr != null && h.teamRankByCjr <= 50)) {
    takeaways.push({
      title: "Priority target",
      body: "Top-tier CJR composite — align RAIN Compliant™ value prop with their scale and quality profile.",
      tone: "good",
    });
  }

  if (h.mspbScore != null && h.mspbScore > 1.05) {
    takeaways.push({
      title: "Efficiency opportunity",
      body: "MSPB above 1.0 signals Medicare spend above national peers — TEAM can support episode efficiency.",
      tone: "warn",
    });
  }

  if (takeaways.length === 0) {
    takeaways.push({
      title: "Stable profile",
      body: "Solid quality and efficiency markers — lead with Rainfall partnership and TEAM readiness.",
      tone: "neutral",
    });
  }

  return {
    slug: h.slug,
    name: h.name,
    state: h.state,
    city: h.city,
    healthSystem: h.healthSystem,
    region: h.region,
    headline: h.healthSystem ? `${h.healthSystem} · ${h.state}` : `${h.city ?? "TEAM"} · ${h.state}`,
    pitch: buildPitch(h),
    metrics,
    takeaways,
    flags: buildFlags(h),
    outreachStatus: h.outreachStatus,
    pipelineStatus: h.pipelineStatus,
    salesStage: h.salesStage,
    estTcv: h.estTcv,
    teamRankByCjr: h.teamRankByCjr,
    cjrTop50: h.cjrTop50,
  };
}
