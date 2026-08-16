import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { G, Path, Rect, Text as SvgText } from "react-native-svg";
import type { DirectoryHospital } from "@/src/lib/hospital-directory-record";
import { directoryHospitals, getStateSummary } from "@/src/lib/directory-index";
import { US_STATE_PATHS, US_VIEWBOX } from "@/src/data/us-state-paths";
import { Colors } from "@/constants/theme";

type MetricKey = "count" | "stars" | "outreach" | "cjr";

function metricValue(state: string, key: MetricKey): number {
  const summary = getStateSummary(state);
  switch (key) {
    case "count":
      return directoryHospitals.filter((h) => h.state === state).length;
    case "stars":
      return summary?.medianStars ?? 0;
    case "outreach":
      return summary?.pctOutreachYes ?? 0;
    case "cjr":
      return summary?.medianTeamRankCjr != null ? 700 - summary.medianTeamRankCjr : 0;
  }
}

function colorFor(value: number, min: number, max: number, empty = false): string {
  if (empty) return "#e2e8f0";
  if (max <= min) return "#dbe7ff";
  const t = (value - min) / (max - min);
  const r = Math.round(219 + (31 - 219) * t);
  const g = Math.round(230 + (88 - 230) * t);
  const b = Math.round(255 + (196 - 255) * t);
  return `rgb(${r},${g},${b})`;
}

function labelFill(fill: string): string {
  const m = fill.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!m) return Colors.ink;
  const lum = (Number(m[1]) * 299 + Number(m[2]) * 587 + Number(m[3]) * 114) / 1000;
  return lum < 150 ? "#ffffff" : Colors.ink;
}

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) hash = (hash * 33 + slug.charCodeAt(i)) >>> 0;
  return hash;
}

function pinPosition(origin: { x: number; y: number }, slug: string, index: number, total: number) {
  const hash = hashSlug(slug);
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 + (hash % 40) * 0.02;
  const radius = 10 + (hash % 18);
  return {
    x: origin.x + Math.cos(angle) * radius,
    y: origin.y + Math.sin(angle) * radius,
  };
}

function pinLabel(hospital: DirectoryHospital, pinMetric: "cjr" | "stars"): string {
  if (pinMetric === "stars") return hospital.overallRating != null ? `${hospital.overallRating}★` : "—";
  return hospital.teamRankByCjr != null ? `#${hospital.teamRankByCjr}` : "•";
}

interface TeamStateMapProps {
  metric?: MetricKey;
  selectedState?: string | null;
  onSelectState?: (state: string | null) => void;
  compact?: boolean;
  showHospitalPins?: boolean;
  pinHospitals?: DirectoryHospital[];
  selectedHospital?: string | null;
  onSelectHospital?: (slug: string) => void;
  pinMetric?: "cjr" | "stars";
}

const METRIC_CAPTION: Record<MetricKey, string> = {
  count: "Hospital count",
  stars: "Median CMS stars",
  outreach: "% outreach",
  cjr: "CJR priority",
};

export function TeamStateMap({
  metric = "count",
  selectedState,
  onSelectState,
  compact,
  showHospitalPins,
  pinHospitals,
  selectedHospital,
  onSelectHospital,
  pinMetric = "cjr",
}: TeamStateMapProps) {
  const states = useMemo(() => Object.keys(US_STATE_PATHS).sort(), []);

  const { colors } = useMemo(() => {
    const values = states.map((st) => metricValue(st, metric)).filter((n) => n > 0);
    const minV = values.length ? Math.min(...values) : 0;
    const maxV = values.length ? Math.max(...values) : 1;
    const map: Record<string, string> = {};
    states.forEach((st) => {
      const v = metricValue(st, metric);
      map[st] = colorFor(v, minV, maxV, v === 0);
    });
    return { colors: map };
  }, [metric, states]);

  const height = compact ? 196 : 280;
  const pins = showHospitalPins && selectedState ? (pinHospitals ?? []).slice(0, 40) : [];
  const origin = selectedState ? US_STATE_PATHS[selectedState] : null;

  return (
    <View className="overflow-hidden rounded-[24px] border border-border bg-bg-elevated p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-fg">TEAM hospitals by state</Text>
        <Text className="text-xs text-subtle">{METRIC_CAPTION[metric]}</Text>
      </View>
      <Svg width="100%" height={height} viewBox={US_VIEWBOX} preserveAspectRatio="xMidYMid meet">
        <G>
          {states.map((st) => {
            const path = US_STATE_PATHS[st];
            if (!path) return null;
            const selected = selectedState === st;
            const faded = Boolean(selectedState && !selected);
            const fill = colors[st] ?? "#e2e8f0";
            const hasHospitals = directoryHospitals.some((h) => h.state === st);
            return (
              <G key={st} opacity={faded ? 0.22 : 1}>
                <Path
                  d={path.d}
                  fill={selected ? Colors.brand[500] : fill}
                  stroke={selected ? Colors.brand[700] : "#f8fafc"}
                  strokeWidth={selected ? 2 : 0.8}
                  onPress={() => {
                    if (!hasHospitals) return;
                    onSelectState?.(selected ? null : st);
                  }}
                />
                <SvgText
                  x={path.x}
                  y={path.y + 3}
                  fill={selected ? "#ffffff" : labelFill(fill)}
                  fontSize={compact ? 8 : 9}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {st}
                </SvgText>
              </G>
            );
          })}
          {origin
            ? pins.map((hospital, index) => {
                const pos = pinPosition({ x: origin.x, y: origin.y }, hospital.slug, index, pins.length);
                const active = selectedHospital === hospital.slug;
                const label = pinLabel(hospital, pinMetric);
                const w = Math.max(26, label.length * 6.2 + 8);
                return (
                  <G key={hospital.slug} onPress={() => onSelectHospital?.(hospital.slug)}>
                    <Rect
                      x={pos.x - w / 2}
                      y={pos.y - 9}
                      width={w}
                      height={16}
                      rx={5}
                      fill={active ? "#f8fafc" : "#0f172a"}
                    />
                    <SvgText
                      x={pos.x}
                      y={pos.y + 2.5}
                      fill={active ? Colors.brand[700] : "#ffffff"}
                      fontSize={7}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {label}
                    </SvgText>
                  </G>
                );
              })
            : null}
        </G>
      </Svg>
      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-10 rounded-full" style={{ backgroundColor: colorFor(0, 0, 1) }} />
          <View className="h-2 w-10 rounded-full" style={{ backgroundColor: colorFor(1, 0, 1) }} />
          <Text className="text-[10px] text-subtle">Low → high</Text>
        </View>
        {selectedState ? (
          <Pressable onPress={() => onSelectState?.(null)}>
            <Text className="text-xs font-semibold text-brand-600">
              {selectedState}
              {pins.length ? ` · ${pins.length} pins` : ""} · clear
            </Text>
          </Pressable>
        ) : (
          <Text className="text-[10px] text-subtle">Tap a state</Text>
        )}
      </View>
    </View>
  );
}
