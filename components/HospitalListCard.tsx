import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Bookmark, ChevronRight } from "lucide-react-native";
import type { DirectoryHospital } from "@/src/lib/hospital-directory-record";
import { buildBattleCard } from "@/lib/battle-card";
import { HospitalMark } from "@/components/HospitalMark";
import { LocationRow } from "@/components/LocationRow";
import { PeerBar } from "@/components/metrics/PeerBar";
import { StarRow } from "@/components/metrics/StarRow";
import { Colors } from "@/constants/theme";

interface HospitalListCardProps {
  hospital: DirectoryHospital;
  saved?: boolean;
  onToggleSave?: () => void;
}

export function HospitalListCard({ hospital, saved, onToggleSave }: HospitalListCardProps) {
  const router = useRouter();
  const card = buildBattleCard(hospital);
  const cjrMetric = card.metrics.find((m) => m.label === "CJR rank");

  return (
    <Pressable
      onPress={() => router.push(`/hospital/${hospital.slug}`)}
      className="mb-3 rounded-[24px] border border-border bg-bg-elevated p-4 active:opacity-90"
    >
      <View className="flex-row items-start justify-between gap-3">
        <HospitalMark name={hospital.name} seed={hospital.healthSystem ?? hospital.name} size="md" />
        <View className="flex-1">
          <Text className="text-base font-semibold text-fg" numberOfLines={2}>
            {hospital.name}
          </Text>
          <Text className="mt-0.5 text-sm text-muted" numberOfLines={1}>
            {card.headline}
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            <StarRow value={hospital.overallRating} size={12} />
            {hospital.teamRankByCjr != null ? (
              <View className="rounded-full bg-brand-50 px-2 py-0.5">
                <Text className="text-[11px] font-semibold text-brand-700">CJR #{hospital.teamRankByCjr}</Text>
              </View>
            ) : null}
          </View>
          <Text className="mt-2 text-xs leading-4 text-muted" numberOfLines={2}>
            {card.takeaways[0]?.body ?? card.headline}
          </Text>
        </View>
        {onToggleSave ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleSave();
            }}
            hitSlop={8}
          >
            <Bookmark
              size={20}
              color={saved ? Colors.brand[500] : Colors.subtle}
              fill={saved ? Colors.brand[500] : "transparent"}
            />
          </Pressable>
        ) : null}
      </View>

      {cjrMetric ? (
        <View className="mt-3">
          <PeerBar percent={cjrMetric.peerPercent} tone={cjrMetric.tone} />
        </View>
      ) : null}

      <View className="mt-3">
        <LocationRow place={hospital} />
      </View>

      {card.flags.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {card.flags.slice(0, 3).map((flag) => (
            <View key={flag} className="rounded-full bg-amber-50 px-2 py-1">
              <Text className="text-xs font-medium text-warn">{flag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="mt-3 flex-row items-center justify-end">
        <Text className="text-sm font-medium text-brand-600">Open battle card</Text>
        <ChevronRight size={16} color={Colors.brand[500]} />
      </View>
    </Pressable>
  );
}
