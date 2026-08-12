import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { HospitalListCard } from "@/components/HospitalListCard";
import { TeamStateMap } from "@/components/TeamStateMap";
import { Chip } from "@/components/ui/Chip";
import { SearchBar } from "@/components/ui/SearchBar";
import { useFilters } from "@/lib/filter-context";
import { filterHospitals, getFilterChips } from "@/lib/search";
import { getWatchlist, toggleWatchlist } from "@/lib/storage";
import { directoryHospitals } from "@/src/lib/directory-index";
import { useFocusEffect } from "expo-router";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const { filters, setFilters, selectedState, setSelectedState } = useFilters();
  const [saved, setSaved] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      void getWatchlist().then(setSaved);
    }, []),
  );

  const activeFilters = useMemo(
    () => ({ ...filters, q: query, state: selectedState ?? filters.state }),
    [filters, query, selectedState],
  );
  const results = useMemo(() => filterHospitals(activeFilters), [activeFilters]);
  const chips = getFilterChips();

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.slug}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 112, paddingTop: 16 }}
        ListHeaderComponent={
          <View>
            <AppHeader
              subtitle={`${directoryHospitals.length} TEAM hospitals · search, save, and prep battle cards`}
            />
            <SearchBar value={query} onChangeText={setQuery} />
            <TeamStateMap
              compact
              selectedState={selectedState}
              onSelectState={setSelectedState}
              metric="count"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 mb-2">
              <View className="flex-row gap-2 pr-4">
                {chips.map((chip) => {
                  const active =
                    JSON.stringify({ ...chip.filters, q: undefined }) ===
                    JSON.stringify({ ...filters, q: undefined, sort: filters.sort ?? "cjr" });
                  return (
                    <Chip
                      key={chip.label}
                      label={chip.label}
                      active={active}
                      onPress={() => {
                        setSelectedState(null);
                        setFilters((prev) => ({ ...prev, ...chip.filters }));
                      }}
                    />
                  );
                })}
                <Chip label="Clear" onPress={() => { setFilters({ sort: "cjr" }); setSelectedState(null); }} />
              </View>
            </ScrollView>
            <Text className="mb-3 text-sm text-muted">{results.length} hospitals</Text>
          </View>
        }
        renderItem={({ item }) => (
          <HospitalListCard
            hospital={item}
            saved={saved.includes(item.slug)}
            onToggleSave={async () => {
              await toggleWatchlist(item.slug);
              setSaved(await getWatchlist());
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}
