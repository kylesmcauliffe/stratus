import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import type { BattleCardTone } from "@/lib/battle-card";
import { Colors } from "@/constants/theme";

interface RingGaugeProps {
  value: number | null;
  max?: number;
  tone?: BattleCardTone;
  size?: number;
}

function toneColor(tone: BattleCardTone): string {
  if (tone === "good") return Colors.good;
  if (tone === "warn") return Colors.warn;
  return Colors.brand[500];
}

export function RingGauge({ value, max = 100, tone = "neutral", size = 52 }: RingGaugeProps) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = value == null || max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));
  const color = toneColor(tone);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={Colors.paperBorder}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}
