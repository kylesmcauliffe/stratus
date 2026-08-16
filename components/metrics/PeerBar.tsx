import { View } from "react-native";
import type { BattleCardTone } from "@/lib/battle-card";
import { Colors } from "@/constants/theme";

interface PeerBarProps {
  percent: number | null;
  tone?: BattleCardTone;
}

function toneColor(tone: BattleCardTone): string {
  if (tone === "good") return Colors.good;
  if (tone === "warn") return Colors.warn;
  return Colors.brand[500];
}

export function PeerBar({ percent, tone = "neutral" }: PeerBarProps) {
  const width = percent == null ? 0 : Math.max(4, Math.min(100, percent));
  return (
    <View className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: Colors.paperBorder }}>
      <View
        className="h-full rounded-full"
        style={{ width: `${width}%`, backgroundColor: toneColor(tone) }}
      />
    </View>
  );
}
