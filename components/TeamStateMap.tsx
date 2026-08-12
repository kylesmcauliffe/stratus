import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";
import type { DirectoryHospital } from "@/src/lib/hospital-directory-record";
import { directoryHospitals, getStateSummary, stateSummariesByState } from "@/src/lib/directory-index";
import { Colors } from "@/constants/theme";

/** Albers-ish normalized positions for state labels on a simple US map canvas. */
const STATE_POS: Record<string, { x: number; y: number }> = {
  AL: { x: 520, y: 420 }, AK: { x: 120, y: 520 }, AZ: { x: 180, y: 380 },
  AR: { x: 460, y: 380 }, CA: { x: 90, y: 320 }, CO: { x: 280, y: 300 },
  CT: { x: 720, y: 220 }, DE: { x: 710, y: 280 }, FL: { x: 620, y: 520 },
  GA: { x: 580, y: 420 }, HI: { x: 280, y: 560 }, IA: { x: 460, y: 260 },
  ID: { x: 200, y: 200 }, IL: { x: 520, y: 280 }, IN: { x: 560, y: 280 },
  KS: { x: 420, y: 320 }, KY: { x: 560, y: 330 }, LA: { x: 480, y: 460 },
  MA: { x: 740, y: 210 }, MD: { x: 690, y: 280 }, ME: { x: 760, y: 160 },
  MI: { x: 560, y: 220 }, MN: { x: 460, y: 180 }, MO: { x: 480, y: 320 },
  MS: { x: 520, y: 440 }, MT: { x: 280, y: 160 }, NC: { x: 640, y: 360 },
  ND: { x: 420, y: 160 }, NE: { x: 400, y: 280 }, NH: { x: 750, y: 190 },
  NJ: { x: 710, y: 260 }, NM: { x: 280, y: 400 }, NV: { x: 160, y: 280 },
  NY: { x: 700, y: 210 }, OH: { x: 590, y: 280 }, OK: { x: 400, y: 380 },
  OR: { x: 120, y: 180 }, PA: { x: 660, y: 260 }, RI: { x: 755, y: 225 },
  SC: { x: 640, y: 400 }, SD: { x: 420, y: 220 }, TN: { x: 540, y: 360 },
  TX: { x: 380, y: 440 }, UT: { x: 220, y: 300 }, VA: { x: 670, y: 320 },
  VT: { x: 735, y: 180 }, WA: { x: 120, y: 120 }, WI: { x: 500, y: 210 },
  WV: { x: 640, y: 300 }, WY: { x: 300, y: 240 }, DC: { x: 695, y: 295 },
};

type MetricKey = "count" | "stars" | "outreach" | "cjr";

function metricValue(state: string, key: MetricKey, hospitals: DirectoryHospital[]): number {
  const list = hospitals.filter((h) => h.state === state);
  const summary = getStateSummary(state);
  switch (key) {
    case "count":
      return list.length;
    case "stars":
      return summary?.medianStars ?? 0;
    case "outreach":
      return summary?.pctOutreachYes ?? 0;
    case "cjr":
      return summary?.medianTeamRankCjr != null ? 700 - summary.medianTeamRankCjr : 0;
  }
}

function colorFor(value: number, min: number, max: number): string {
  if (max <= min) return Colors.brand[100];
  const t = (value - min) / (max - min);
  const r = Math.round(219 + (43 - 219) * t);
  const g = Math.round(230 + (114 - 230) * t);
  const b = Math.round(255 + (230 - 255) * t);
  return `rgb(${r},${g},${b})`;
}

interface TeamStateMapProps {
  metric?: MetricKey;
  selectedState?: string | null;
  onSelectState?: (state: string | null) => void;
  compact?: boolean;
}

export function TeamStateMap({
  metric = "count",
  selectedState,
  onSelectState,
  compact,
}: TeamStateMapProps) {
  const states = useMemo(() => Object.keys(stateSummariesByState).sort(), []);

  const { min, max, colors } = useMemo(() => {
    const values = states.map((st) => metricValue(st, metric, directoryHospitals));
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const map: Record<string, string> = {};
    states.forEach((st) => {
      map[st] = colorFor(metricValue(st, metric, directoryHospitals), minV, maxV);
    });
    return { min: minV, max: maxV, colors: map };
  }, [metric, states]);

  const height = compact ? 220 : 320;

  return (
    <View className="rounded-[24px] bg-bg-elevated border border-border p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-semibold text-fg">TEAM hospitals by state</Text>
        <Text className="text-xs text-subtle capitalize">{metric.replace("cjr", "CJR priority")}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={820} height={height} viewBox="0 0 820 600">
          <G>
            {states.map((st) => {
              const pos = STATE_POS[st];
              if (!pos) return null;
              const y = compact ? pos.y * 0.55 : pos.y * 0.85;
              const x = compact ? pos.x * 0.85 : pos.x;
              const selected = selectedState === st;
              const count = directoryHospitals.filter((h) => h.state === st).length;
              return (
                <G key={st}>
                  <Circle
                    cx={x}
                    cy={y}
                    r={selected ? 22 : Math.max(14, Math.min(20, 10 + count / 8))}
                    fill={colors[st]}
                    stroke={selected ? Colors.brand[500] : "#cbd5e1"}
                    strokeWidth={selected ? 3 : 1}
                    onPress={() => onSelectState?.(selected ? null : st)}
                  />
                  <SvgText
                    x={x}
                    y={y + 4}
                    fill={selected ? Colors.brand[700] : Colors.ink}
                    fontSize={10}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {st}
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>
      </ScrollView>
      {selectedState ? (
        <Pressable onPress={() => onSelectState?.(null)} className="mt-2">
          <Text className="text-sm text-brand-600 font-medium">
            Filtering: {selectedState} · tap to clear
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
