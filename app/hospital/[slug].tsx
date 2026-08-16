import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Bookmark, Share2 } from "lucide-react-native";
import { BattleCardView } from "@/components/BattleCardView";
import { CompareRadarChart } from "@/components/CompareRadarChart";
import { LocationRow } from "@/components/LocationRow";
import { MetricTile } from "@/components/metrics/MetricTile";
import { buildBattleCard } from "@/lib/battle-card";
import { exportBattleCard } from "@/lib/export-battle-card";
import { getNotes, getWatchlist, saveNote, toggleWatchlist } from "@/lib/storage";
import { getDirectoryHospital } from "@/src/lib/directory-index";
import { buildHospitalVsPeerRadar } from "@/src/lib/compare-radar-metrics";
import { Colors } from "@/constants/theme";

function paramString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function HospitalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug: string | string[] }>();
  const slug = paramString(params.slug);
  const hospital = slug ? getDirectoryHospital(slug) : undefined;
  const card = hospital ? buildBattleCard(hospital) : undefined;
  const radar = useMemo(() => (hospital ? buildHospitalVsPeerRadar(hospital) : null), [hospital]);

  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (!slug) return;
      void (async () => {
        setSaved(await getWatchlist().then((list) => list.includes(slug)));
        const notes = await getNotes();
        setNote(notes[slug]?.text ?? "");
      })();
    }, [slug]),
  );

  if (!hospital || !card) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-bg px-6">
        <Text className="text-lg text-muted">Hospital not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="font-semibold text-brand-600">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-2">
          <ArrowLeft size={20} color={Colors.brand[500]} />
          <Text className="font-semibold text-brand-600">Back</Text>
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => void exportBattleCard(card)}
            className="flex-row items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2"
          >
            <Share2 size={18} color={Colors.brand[500]} />
            <Text className="text-sm font-medium text-muted">Export</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              await toggleWatchlist(card.slug);
              setSaved(await getWatchlist().then((list) => list.includes(card.slug)));
            }}
            className="flex-row items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-2"
          >
            <Bookmark
              size={18}
              color={saved ? Colors.brand[500] : Colors.subtle}
              fill={saved ? Colors.brand[500] : "transparent"}
            />
            <Text className="text-sm font-medium text-muted">{saved ? "Saved" : "Save"}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="mb-5 h-[560px]">
          <BattleCardView
            card={card}
            saved={saved}
            onToggleSave={async () => {
              await toggleWatchlist(card.slug);
              setSaved(await getWatchlist().then((list) => list.includes(card.slug)));
            }}
          />
        </View>

        <View className="mb-4">
          <LocationRow place={hospital} />
        </View>

        {radar ? (
          <View className="mb-4 items-center rounded-[24px] border border-border bg-bg-elevated p-4">
            <Text className="mb-2 self-start text-sm font-semibold text-fg">Vs {hospital.state} median</Text>
            <CompareRadarChart data={radar} size={240} />
            <View className="mt-2 flex-row gap-4">
              {radar.labels.map((label, i) => (
                <Text
                  key={label}
                  className="text-xs text-muted"
                  style={{ color: [Colors.brand[700], Colors.brand[500]][i] }}
                >
                  ● {label}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        <View className="mb-4 flex-row flex-wrap justify-between gap-y-3">
          {card.metrics.slice(0, 4).map((metric) => (
            <View key={`profile-${metric.label}`} className="w-[48%]">
              <MetricTile metric={metric} />
            </View>
          ))}
        </View>

        <View className="rounded-[24px] border border-border bg-bg-elevated p-4">
          <Text className="mb-2 text-sm font-semibold text-fg">Your notes</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Talking points, follow-ups, contact context…"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            className="min-h-[120px] rounded-[16px] border border-border bg-bg-soft px-4 py-3 text-fg"
          />
          <Pressable
            onPress={async () => {
              await saveNote(card.slug, note);
            }}
            className="mt-3 items-center rounded-[16px] bg-brand-500 py-3"
          >
            <Text className="font-semibold text-white">Save notes</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
