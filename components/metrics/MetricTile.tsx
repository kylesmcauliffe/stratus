import { Text, View } from "react-native";
import type { BattleCardMetric } from "@/lib/battle-card";
import { PeerBar } from "@/components/metrics/PeerBar";
import { RingGauge } from "@/components/metrics/RingGauge";
import { StarRow } from "@/components/metrics/StarRow";

function valueColor(tone: BattleCardMetric["tone"]): string {
  if (tone === "good") return "text-good";
  if (tone === "warn") return "text-warn";
  return "text-paper-ink";
}

export function MetricTile({ metric }: { metric: BattleCardMetric }) {
  return (
    <View className="min-h-[108px] rounded-[18px] border border-paper-border bg-white px-3 py-3">
      <Text className="text-[11px] font-semibold uppercase tracking-wide text-paper-subtle">{metric.label}</Text>
      <View className="mt-2 flex-row items-center justify-between gap-2">
        <Text className={`text-xl font-bold ${valueColor(metric.tone)}`} numberOfLines={1}>
          {metric.value}
        </Text>
        {metric.kind === "ring" ? (
          <RingGauge value={metric.numeric} max={metric.max ?? 100} tone={metric.tone} size={44} />
        ) : null}
      </View>
      {metric.kind === "stars" ? (
        <View className="mt-2">
          <StarRow value={metric.numeric} />
        </View>
      ) : metric.kind === "ring" ? null : metric.peerPercent != null ? (
        <View className="mt-2">
          <PeerBar percent={metric.peerPercent} tone={metric.tone} />
        </View>
      ) : null}
      {metric.detail ? (
        <Text className="mt-2 text-[11px] leading-4 text-paper-muted" numberOfLines={2}>
          {metric.detail}
        </Text>
      ) : null}
    </View>
  );
}
