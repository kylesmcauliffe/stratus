import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { AppHeader } from "@/components/AppHeader";
import { HospitalListCard } from "@/components/HospitalListCard";
import { TeamStateMap } from "@/components/TeamStateMap";
import { Chip } from "@/components/ui/Chip";
import { PeerBar } from "@/components/metrics/PeerBar";
import { useFilters } from "@/lib/filter-context";
import { filterHospitals } from "@/lib/search";
import { getStateSummary } from "@/src/lib/directory-index";
import { Colors } from "@/constants/theme";

export default function MapScreen() {
  const { selectedState, setSelectedState } = useFilters();
  const [metric, setMetric] = useState<"count" | "stars" | "outreach" | "cjr">("count");
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const hospitals = useMemo(
    () => (selectedState ? filterHospitals({ state: selectedState, sort: "cjr" }) : []),
    [selectedState],
  );
  const summary = selectedState ? getStateSummary(selectedState) : null;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="px-5 pt-4">
        <AppHeader title="State map" subtitle="Tap a state for hospital pins · open a pin or the list" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row gap-2 pr-4">
            {(["count", "stars", "outreach", "cjr"] as const).map((m) => (
              <Chip
                key={m}
                label={m === "cjr" ? "CJR" : m}
                active={metric === m}
                onPress={() => setMetric(m)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="flex-1 px-5">
        <TeamStateMap
          metric={metric}
          selectedState={selectedState}
          onSelectState={(state) => {
            setSelectedState(state);
            setSelectedHospital(null);
            if (state) setExpanded(true);
          }}
          showHospitalPins
          pinHospitals={hospitals}
          selectedHospital={selectedHospital}
          onSelectHospital={(slug) => {
            setSelectedHospital(slug);
            setExpanded(true);
          }}
          pinMetric={metric === "stars" ? "stars" : "cjr"}
        />
      </View>

      {selectedState && summary ? (
        <View
          className="mt-3 rounded-t-[28px] border-t border-border bg-bg-elevated px-5 pt-3"
          style={{ height: expanded ? "46%" : 132 }}
        >
          <Pressable onPress={() => setExpanded((v) => !v)} className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-fg">{selectedState} snapshot</Text>
              <Text className="text-xs text-muted">
                {summary.count} hospitals · tap to {expanded ? "focus map" : "expand list"}
              </Text>
            </View>
            {expanded ? (
              <ChevronDown size={20} color={Colors.subtle} />
            ) : (
              <ChevronUp size={20} color={Colors.subtle} />
            )}
          </Pressable>

          <View className="mb-3 gap-2">
            <SnapshotBar label="Hospitals" value={String(summary.count)} percent={Math.min(100, summary.count)} />
            <SnapshotBar
              label="Median stars"
              value={summary.medianStars != null ? String(summary.medianStars) : "—"}
              percent={summary.medianStars != null ? (summary.medianStars / 5) * 100 : 0}
              tone="good"
            />
            <SnapshotBar
              label="Outreach"
              value={`${summary.pctOutreachYes ?? 0}%`}
              percent={summary.pctOutreachYes ?? 0}
            />
          </View>

          {expanded ? (
            <FlatList
              data={hospitals}
              keyExtractor={(item) => item.slug}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => (
                <View
                  className={selectedHospital === item.slug ? "rounded-[24px] border-2 border-brand-500" : undefined}
                >
                  <HospitalListCard hospital={item} />
                </View>
              )}
            />
          ) : null}
        </View>
      ) : (
        <View className="px-5 pb-8 pt-4">
          <Text className="text-sm text-muted">Select a state on the map to see hospital locations.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function SnapshotBar({
  label,
  value,
  percent,
  tone = "neutral",
}: {
  label: string;
  value: string;
  percent: number;
  tone?: "good" | "warn" | "neutral";
}) {
  return (
    <View>
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-xs font-medium text-muted">{label}</Text>
        <Text className="text-xs font-semibold text-fg">{value}</Text>
      </View>
      <PeerBar percent={percent} tone={tone} />
    </View>
  );
}
