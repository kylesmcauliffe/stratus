import { useCallback, useMemo, useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Link, useFocusEffect } from "expo-router";
import { ExternalLink, Heart, X } from "lucide-react-native";
import { AppHeader } from "@/components/AppHeader";
import { BattleCardView } from "@/components/BattleCardView";
import { Chip } from "@/components/ui/Chip";
import { buildBattleCard } from "@/lib/battle-card";
import { filterHospitals, type SearchFilters } from "@/lib/search";
import { getWatchlist, toggleWatchlist } from "@/lib/storage";

const SWIPE_THRESHOLD = 90;

type DeckPreset = "all" | "cjr" | "outreach" | "stars";

const PRESETS: { id: DeckPreset; label: string; filters: SearchFilters }[] = [
  { id: "all", label: "All", filters: { sort: "cjr" } },
  { id: "cjr", label: "CJR top 50", filters: { cjrTop50: true, sort: "cjr" } },
  { id: "outreach", label: "No outreach", filters: { outreach: "No", sort: "cjr" } },
  { id: "stars", label: "5 stars", filters: { stars: 5, sort: "stars" } },
];

export default function DeckScreen() {
  const [preset, setPreset] = useState<DeckPreset>("all");
  const deck = useMemo(() => filterHospitals(PRESETS.find((p) => p.id === preset)?.filters ?? { sort: "cjr" }), [preset]);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const translateX = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      void getWatchlist().then(setSaved);
    }, []),
  );

  const current = deck[index];
  const card = current ? buildBattleCard(current) : null;
  const behind = [deck[index + 1], deck[index + 2]].filter(Boolean);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 1400);
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, Math.max(deck.length - 1, 0)));
  }, [deck.length]);

  const skip = useCallback(() => {
    showToast("Skipped");
    goNext();
  }, [goNext, showToast]);

  const saveAndNext = useCallback(async () => {
    if (!card) return;
    const list = await getWatchlist();
    if (!list.includes(card.slug)) {
      await toggleWatchlist(card.slug);
      setSaved(await getWatchlist());
      showToast("Saved to watchlist");
    } else {
      showToast("Already saved");
    }
    goNext();
  }, [card, goNext, showToast]);

  const pan = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .failOffsetY([-20, 20])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-Dimensions.get("window").width, { overshootClamping: true }, () => {
          runOnJS(skip)();
          translateX.value = 0;
        });
      } else if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(Dimensions.get("window").width, { overshootClamping: true }, () => {
          runOnJS(saveAndNext)();
          translateX.value = 0;
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: `${translateX.value / 48}deg` }],
  }));

  const saveOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 80], [0, 1], "clamp"),
  }));

  const skipOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-80, 0], [1, 0], "clamp"),
  }));

  function selectPreset(id: DeckPreset) {
    setPreset(id);
    setIndex(0);
    translateX.value = 0;
  }

  if (!card) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-bg px-6">
        <Text className="text-lg text-muted">No hospitals in deck.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-1 px-5 pb-4 pt-4">
        <AppHeader
          title="Battle deck"
          subtitle={`Swipe right to save · left to skip · ${Math.min(index + 1, deck.length)} of ${deck.length}`}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row gap-2 pr-4">
            {PRESETS.map((item) => (
              <Chip
                key={item.id}
                label={item.label}
                active={preset === item.id}
                onPress={() => selectPreset(item.id)}
              />
            ))}
          </View>
        </ScrollView>

        <View className="relative flex-1">
          {behind
            .slice()
            .reverse()
            .map((hospital, i) => {
              const depth = behind.length - 1 - i;
              const scale = 1 - (depth + 1) * 0.04;
              const offset = (depth + 1) * 10;
              return (
                <View
                  key={hospital.slug}
                  pointerEvents="none"
                  className="absolute inset-0"
                  style={{ transform: [{ scale }, { translateY: offset }] }}
                >
                  <BattleCardView card={buildBattleCard(hospital)} compact />
                </View>
              );
            })}

          <GestureDetector gesture={pan}>
            <Animated.View style={[{ flex: 1 }, animatedStyle]}>
              <BattleCardView
                card={card}
                compact
                saved={saved.includes(card.slug)}
                onToggleSave={async () => {
                  await toggleWatchlist(card.slug);
                  setSaved(await getWatchlist());
                }}
              />
              <Animated.View
                pointerEvents="none"
                style={saveOverlay}
                className="absolute left-6 top-8 rounded-full border-2 border-emerald-500 bg-white/90 px-4 py-1"
              >
                <Text className="text-sm font-extrabold tracking-widest text-good">SAVE</Text>
              </Animated.View>
              <Animated.View
                pointerEvents="none"
                style={skipOverlay}
                className="absolute right-6 top-8 rounded-full border-2 border-slate-400 bg-white/90 px-4 py-1"
              >
                <Text className="text-sm font-extrabold tracking-widest text-paper-muted">SKIP</Text>
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        </View>

        <View className="mt-4 flex-row items-center justify-center gap-5">
          <Pressable
            onPress={() => skip()}
            className="h-14 w-14 items-center justify-center rounded-full bg-slate-900 shadow-md"
          >
            <X size={26} color="#fff" strokeWidth={2.5} />
          </Pressable>

          <Link href={`/hospital/${card.slug}`} asChild>
            <Pressable className="flex-row items-center rounded-full bg-brand-500 px-5 py-3.5">
              <Text className="font-semibold text-white">Full profile</Text>
              <ExternalLink size={16} color="#fff" style={{ marginLeft: 8 }} />
            </Pressable>
          </Link>

          <Pressable
            onPress={() => {
              void saveAndNext();
            }}
            className="h-14 w-14 items-center justify-center rounded-full bg-brand-500 shadow-md"
          >
            <Heart size={24} color="#fff" fill="#fff" />
          </Pressable>
        </View>

        <Text className="mt-3 text-center text-xs text-subtle">
          Swipe right to save · left to skip · Tap ↻ on card to flip takeaways
        </Text>
      </View>

      {toast ? (
        <View className="absolute bottom-28 left-8 right-8 items-center">
          <View className="rounded-full bg-slate-900 px-5 py-3">
            <Text className="font-semibold text-white">{toast}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
