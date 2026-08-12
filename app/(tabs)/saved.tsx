import { useCallback, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { HospitalListCard } from "@/components/HospitalListCard";
import { getDirectoryHospital } from "@/src/lib/directory-index";
import { getWatchlist, toggleWatchlist } from "@/lib/storage";

export default function SavedScreen() {
  const [saved, setSaved] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      void getWatchlist().then(setSaved);
    }, []),
  );

  const hospitals = useMemo(
    () => saved.map((slug) => getDirectoryHospital(slug)).filter(Boolean),
    [saved],
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <FlatList
        data={hospitals}
        keyExtractor={(item) => item!.slug}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 112, paddingTop: 16 }}
        ListHeaderComponent={
          <AppHeader
            title="Saved cards"
            subtitle={
              saved.length
                ? `${saved.length} hospitals bookmarked for conferences and follow-up`
                : "Tap the bookmark on any card to save it here"
            }
          />
        }
        ListEmptyComponent={
          <View className="rounded-[24px] bg-bg-elevated border border-border p-6">
            <Text className="text-base text-muted">
              No saved hospitals yet. Browse Home or the Deck and bookmark hospitals you want at your fingertips.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <HospitalListCard
            hospital={item!}
            saved
            onToggleSave={async () => {
              await toggleWatchlist(item!.slug);
              setSaved(await getWatchlist());
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}
