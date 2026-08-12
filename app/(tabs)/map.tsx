import { useMemo, useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { TeamStateMap } from "@/components/TeamStateMap";
import { HospitalListCard } from "@/components/HospitalListCard";
import { Chip } from "@/components/ui/Chip";
import { useFilters } from "@/lib/filter-context";
import { filterHospitals } from "@/lib/search";
import { getStateSummary } from "@/src/lib/directory-index";

export default function MapScreen() {
  const { selectedState, setSelectedState } = useFilters();
  const [metric, setMetric] = useState<"count" | "stars" | "outreach" | "cjr">("count");

  const hospitals = useMemo(
    () => (selectedState ? filterHospitals({ state: selectedState, sort: "cjr" }) : []),
    [selectedState],
  );
  const summary = selectedState ? getStateSummary(selectedState) : null;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <FlatList
        data={hospitals}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 112, paddingTop: 16 }}
        ListHeaderComponent={
          <View>
            <AppHeader
              title="State map"
              subtitle="Tap a state to filter hospitals · drag map horizontally"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              <View className="flex-row gap-2 pr-4">
                {(["count", "stars", "outreach", "cjr"] as const).map((m) => (
                  <Chip key={m} label={m === "cjr" ? "CJR" : m} active={metric === m} onPress={() => setMetric(m)} />
                ))}
              </View>
            </ScrollView>
            <TeamStateMap
              metric={metric}
              selectedState={selectedState}
              onSelectState={setSelectedState}
            />
            {summary ? (
              <View className="mt-4 rounded-[20px] bg-brand-50 border border-brand-100 p-4">
                <Text className="text-lg font-bold text-fg">{selectedState} snapshot</Text>
                <Text className="mt-1 text-sm text-muted">
                  {summary.count} hospitals · median {summary.medianStars ?? "—"} stars · {summary.pctOutreachYes ?? 0}% outreach
                </Text>
              </View>
            ) : (
              <Text className="mt-4 text-sm text-muted">Select a state on the map to see hospitals.</Text>
            )}
            {selectedState ? (
              <Text className="mt-4 mb-2 text-sm font-semibold text-muted">{hospitals.length} hospitals in {selectedState}</Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <HospitalListCard hospital={item} />}
      />
    </SafeAreaView>
  );
}
