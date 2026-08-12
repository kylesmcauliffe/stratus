import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Bookmark, Share2 } from "lucide-react-native";
import { BattleCardView } from "@/components/BattleCardView";
import { buildBattleCard } from "@/lib/battle-card";
import { exportBattleCard } from "@/lib/export-battle-card";
import { getNotes, getWatchlist, saveNote, toggleWatchlist } from "@/lib/storage";
import { getDirectoryHospital } from "@/src/lib/directory-index";
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
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6">
        <Text className="text-lg text-muted">Hospital not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-brand-600 font-semibold">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-2">
          <ArrowLeft size={20} color={Colors.brand[500]} />
          <Text className="font-semibold text-brand-600">Back</Text>
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => void exportBattleCard(card)}
            className="flex-row items-center gap-2 rounded-full bg-bg-elevated border border-border px-4 py-2"
          >
            <Share2 size={18} color={Colors.brand[500]} />
            <Text className="text-sm font-medium text-muted">Export</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              await toggleWatchlist(card.slug);
              setSaved(await getWatchlist().then((list) => list.includes(card.slug)));
            }}
            className="flex-row items-center gap-2 rounded-full bg-bg-elevated border border-border px-4 py-2"
          >
            <Bookmark size={18} color={saved ? Colors.brand[500] : Colors.subtle} fill={saved ? Colors.brand[500] : "transparent"} />
            <Text className="text-sm font-medium text-muted">{saved ? "Saved" : "Save"}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="h-[520px] mb-5">
          <BattleCardView
            card={card}
            saved={saved}
            onToggleSave={async () => {
              await toggleWatchlist(card.slug);
              setSaved(await getWatchlist().then((list) => list.includes(card.slug)));
            }}
          />
        </View>

        <View className="rounded-[24px] bg-bg-elevated border border-border p-4">
          <Text className="text-sm font-semibold text-fg mb-2">Your notes</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Talking points, follow-ups, contact context…"
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            className="min-h-[120px] rounded-[16px] bg-bg-soft px-4 py-3 text-fg border border-border"
          />
          <Pressable
            onPress={async () => {
              await saveNote(card.slug, note);
            }}
            className="mt-3 rounded-[16px] bg-brand-500 py-3 items-center"
          >
            <Text className="font-semibold text-white">Save notes</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
