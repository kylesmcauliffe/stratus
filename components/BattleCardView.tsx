import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertTriangle,
  Bookmark,
  CheckCircle2,
  MapPin,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react-native";
import type { BattleCard, BattleCardTakeaway } from "@/lib/battle-card";
import { HospitalMark } from "@/components/HospitalMark";
import { MetricTile } from "@/components/metrics/MetricTile";
import { StarRow } from "@/components/metrics/StarRow";
import { Colors } from "@/constants/theme";

interface BattleCardViewProps {
  card: BattleCard;
  saved?: boolean;
  onToggleSave?: () => void;
  compact?: boolean;
}

function takeawayIcon(item: BattleCardTakeaway) {
  const color = item.tone === "good" ? Colors.good : item.tone === "warn" ? Colors.warn : Colors.brand[500];
  if (item.tone === "warn") return <AlertTriangle size={18} color={color} />;
  if (item.title.toLowerCase().includes("priority")) return <Target size={18} color={color} />;
  if (item.tone === "good") return <Sparkles size={18} color={color} />;
  return <CheckCircle2 size={18} color={color} />;
}

export function BattleCardView({ card, saved, onToggleSave, compact }: BattleCardViewProps) {
  const [flipped, setFlipped] = useState(false);
  const visibleMetrics = card.metrics.slice(0, compact ? 4 : 6);

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#eef4ff", "#ffffff", "#ffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 overflow-hidden rounded-[28px] border border-paper-border"
      >
        <ScrollView
          contentContainerStyle={{ padding: 18, paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-row flex-1 items-start gap-3">
              <HospitalMark name={card.name} seed={card.healthSystem ?? card.name} size={compact ? "md" : "lg"} />
              <View className="flex-1">
                <Text className="text-[11px] font-semibold uppercase tracking-widest text-brand-600">
                  {flipped ? "Takeaways" : "Battle card"}
                </Text>
                <Text
                  className="mt-1 text-xl font-bold leading-6 text-paper-ink"
                  numberOfLines={compact ? 2 : 3}
                >
                  {card.name}
                </Text>
                <View className="mt-1 flex-row items-center gap-1">
                  <MapPin size={12} color={Colors.paperSubtle} />
                  <Text className="flex-1 text-sm text-paper-muted" numberOfLines={1}>
                    {card.headline}
                  </Text>
                </View>
                <View className="mt-2 flex-row items-center gap-2">
                  <StarRow value={card.overallRating ?? null} size={13} />
                  {card.teamRankByCjr != null ? (
                    <View className="rounded-full bg-brand-500 px-2 py-0.5">
                      <Text className="text-[11px] font-bold text-white">CJR #{card.teamRankByCjr}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
            <View className="flex-row gap-2">
              {onToggleSave ? (
                <Pressable
                  onPress={onToggleSave}
                  className="h-10 w-10 items-center justify-center rounded-full border border-paper-border bg-white"
                >
                  <Bookmark
                    size={18}
                    color={saved ? Colors.brand[500] : Colors.paperSubtle}
                    fill={saved ? Colors.brand[500] : "transparent"}
                  />
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => setFlipped((v) => !v)}
                className="h-10 w-10 items-center justify-center rounded-full border border-paper-border bg-white"
              >
                <RotateCcw size={18} color={Colors.brand[500]} />
              </Pressable>
            </View>
          </View>

          {!flipped ? (
            <>
              <View className="mt-4 flex-row flex-wrap gap-2">
                {card.flags.map((flag) => (
                  <View key={flag} className="rounded-full bg-brand-100 px-3 py-1">
                    <Text className="text-xs font-semibold text-brand-700">{flag}</Text>
                  </View>
                ))}
              </View>

              <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
                {visibleMetrics.map((metric) => (
                  <View key={metric.label} className="w-[48%]">
                    <MetricTile metric={metric} />
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View className="mt-5 gap-3">
              {card.takeaways.map((item) => (
                <View
                  key={item.title}
                  className="flex-row gap-3 rounded-[20px] border border-paper-border bg-white p-4"
                >
                  <View className="mt-0.5">{takeawayIcon(item)}</View>
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-semibold ${
                        item.tone === "good"
                          ? "text-good"
                          : item.tone === "warn"
                            ? "text-warn"
                            : "text-paper-ink"
                      }`}
                    >
                      {item.title}
                    </Text>
                    <Text className="mt-1 text-sm leading-5 text-paper-muted">{item.body}</Text>
                  </View>
                </View>
              ))}

              <View className="mt-1 rounded-[20px] bg-brand-500 p-4">
                <View className="flex-row items-center gap-2">
                  <MessageSquare size={16} color="#fff" />
                  <Text className="text-xs font-semibold uppercase tracking-widest text-white/80">
                    Rainfall talk track
                  </Text>
                </View>
                <Text className="mt-2 text-sm leading-6 text-white">
                  RAIN Compliant™ helps TEAM hospitals reduce readmissions, improve episode efficiency, and
                  align with CMS quality programs — with measurable ROI on MSPB and HVBP.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
