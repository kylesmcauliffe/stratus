import { Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { Colors } from "@/constants/theme";
import type { InsightStat } from "@/lib/insights";

export function InsightCard({
  kicker,
  headline,
  body,
  stats,
}: {
  kicker?: string;
  headline: string;
  body: string;
  stats?: InsightStat[];
}) {
  return (
    <View className="mb-4 overflow-hidden rounded-[24px] border border-brand-200 bg-brand-50 p-4">
      <View className="mb-2 flex-row items-center gap-2">
        <Sparkles size={14} color={Colors.brand[600]} />
        <Text className="text-[11px] font-semibold uppercase tracking-widest text-brand-700">
          {kicker ?? "Briefing"}
        </Text>
      </View>
      <Text className="text-base font-bold leading-5 text-paper-ink">{headline}</Text>
      <Text className="mt-2 text-sm leading-5 text-paper-muted">{body}</Text>
      {stats?.length ? (
        <View className="mt-4 flex-row flex-wrap gap-2">
          {stats.map((stat) => (
            <View key={stat.label} className="min-w-[72px] rounded-2xl bg-white/80 px-3 py-2">
              <Text className="text-base font-bold text-paper-ink">{stat.value}</Text>
              <Text className="text-[10px] font-medium uppercase tracking-wide text-paper-subtle">{stat.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
