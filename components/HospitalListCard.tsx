import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Bookmark, ChevronRight, Star } from "lucide-react-native";
import type { DirectoryHospital } from "@/src/lib/hospital-directory-record";
import { buildBattleCard } from "@/lib/battle-card";
import { Colors } from "@/constants/theme";

interface HospitalListCardProps {
  hospital: DirectoryHospital;
  saved?: boolean;
  onToggleSave?: () => void;
}

export function HospitalListCard({ hospital, saved, onToggleSave }: HospitalListCardProps) {
  const router = useRouter();
  const card = buildBattleCard(hospital);

  return (
    <Pressable
      onPress={() => router.push(`/hospital/${hospital.slug}`)}
      className="rounded-[24px] bg-bg-elevated border border-border p-4 mb-3 active:opacity-90"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-fg" numberOfLines={2}>
            {hospital.name}
          </Text>
          <Text className="mt-1 text-sm text-muted">{card.headline}</Text>
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

      <View className="mt-4 flex-row flex-wrap gap-2">
        <View className="flex-row items-center rounded-full bg-brand-50 px-3 py-1">
          <Star size={14} color={Colors.brand[500]} fill={Colors.brand[500]} />
          <Text className="ml-1 text-sm font-medium text-brand-700">
            {hospital.overallRating ?? "—"} stars
          </Text>
        </View>
        {hospital.teamRankByCjr != null ? (
          <View className="rounded-full bg-bg-soft px-3 py-1">
            <Text className="text-sm text-muted">CJR #{hospital.teamRankByCjr}</Text>
          </View>
        ) : null}
        {hospital.outreachStatus ? (
          <View className="rounded-full bg-bg-soft px-3 py-1">
            <Text className="text-sm text-muted">{hospital.outreachStatus} outreach</Text>
          </View>
        ) : null}
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

      <View className="mt-4 flex-row items-center justify-end">
        <Text className="text-sm font-medium text-brand-600">Open battle card</Text>
        <ChevronRight size={16} color={Colors.brand[500]} />
      </View>
    </Pressable>
  );
}
