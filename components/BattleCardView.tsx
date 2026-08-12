import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Bookmark, RotateCcw } from "lucide-react-native";
import type { BattleCard } from "@/lib/battle-card";
import { Colors } from "@/constants/theme";

interface BattleCardViewProps {
  card: BattleCard;
  saved?: boolean;
  onToggleSave?: () => void;
  compact?: boolean;
}

export function BattleCardView({ card, saved, onToggleSave, compact }: BattleCardViewProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#eef4ff", "#f8fafc", "#ffffff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 rounded-[28px] overflow-hidden border border-border"
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                {flipped ? "Takeaways" : "Battle card"}
              </Text>
              <Text className="mt-2 text-2xl font-bold text-fg" numberOfLines={compact ? 2 : 4}>
                {card.name}
              </Text>
              <Text className="mt-1 text-sm text-muted">{card.headline}</Text>
            </View>
            <View className="flex-row gap-2">
              {onToggleSave ? (
                <Pressable
                  onPress={onToggleSave}
                  className="h-10 w-10 items-center justify-center rounded-full bg-white/80 border border-border"
                >
                  <Bookmark
                    size={18}
                    color={saved ? Colors.brand[500] : Colors.subtle}
                    fill={saved ? Colors.brand[500] : "transparent"}
                  />
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => setFlipped((v) => !v)}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/80 border border-border"
              >
                <RotateCcw size={18} color={Colors.brand[500]} />
              </Pressable>
            </View>
          </View>

          {!flipped ? (
            <>
              <View className="mt-5 rounded-[20px] bg-white/90 p-4 border border-border">
                <Text className="text-sm leading-6 text-muted">{card.pitch}</Text>
              </View>

              <View className="mt-4 flex-row flex-wrap gap-2">
                {card.flags.map((flag) => (
                  <View key={flag} className="rounded-full bg-brand-50 px-3 py-1">
                    <Text className="text-xs font-medium text-brand-700">{flag}</Text>
                  </View>
                ))}
              </View>

              <View className="mt-5 gap-3">
                {card.metrics.map((metric) => (
                  <View
                    key={metric.label}
                    className="rounded-[18px] bg-white/90 px-4 py-3 border border-border"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-muted">{metric.label}</Text>
                      <Text
                        className={`text-base font-semibold ${
                          metric.tone === "good"
                            ? "text-good"
                            : metric.tone === "warn"
                              ? "text-warn"
                              : "text-fg"
                        }`}
                      >
                        {metric.value}
                      </Text>
                    </View>
                    {metric.detail ? (
                      <Text className="mt-1 text-xs text-subtle">{metric.detail}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View className="mt-5 gap-3">
              {card.takeaways.map((item) => (
                <View
                  key={item.title}
                  className="rounded-[20px] bg-white/90 p-4 border border-border"
                >
                  <Text
                    className={`text-sm font-semibold ${
                      item.tone === "good" ? "text-good" : item.tone === "warn" ? "text-warn" : "text-fg"
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-muted">{item.body}</Text>
                </View>
              ))}

              <View className="rounded-[20px] bg-brand-500 p-4 mt-2">
                <Text className="text-xs font-semibold uppercase tracking-widest text-white/80">
                  Rainfall talk track
                </Text>
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
