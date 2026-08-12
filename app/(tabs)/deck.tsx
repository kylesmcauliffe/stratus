import { useCallback, useMemo, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Link, useFocusEffect } from "expo-router";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react-native";
import { AppHeader } from "@/components/AppHeader";
import { BattleCardView } from "@/components/BattleCardView";
import { buildBattleCard } from "@/lib/battle-card";
import { filterHospitals } from "@/lib/search";
import { getWatchlist, toggleWatchlist } from "@/lib/storage";
import { Colors } from "@/constants/theme";

const SWIPE_THRESHOLD = 80;

export default function DeckScreen() {
  const deck = useMemo(() => filterHospitals({ sort: "cjr" }), []);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const translateX = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      void getWatchlist().then(setSaved);
    }, []),
  );

  const current = deck[index];
  const card = current ? buildBattleCard(current) : null;

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, deck.length - 1));
  }, [deck.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-Dimensions.get("window").width, {}, () => {
          runOnJS(goNext)();
          translateX.value = 0;
        });
      } else if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(Dimensions.get("window").width, {}, () => {
          runOnJS(goPrev)();
          translateX.value = 0;
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: `${translateX.value / 40}deg` }],
  }));

  if (!card) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6">
        <Text className="text-lg text-muted">No hospitals in deck.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-1 px-5 pt-4 pb-6">
        <AppHeader
          title="Battle deck"
          subtitle={`Swipe through priority hospitals · ${index + 1} of ${deck.length}`}
        />

        <GestureDetector gesture={pan}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <BattleCardView
              card={card}
              saved={saved.includes(card.slug)}
              onToggleSave={async () => {
                await toggleWatchlist(card.slug);
                setSaved(await getWatchlist());
              }}
            />
          </Animated.View>
        </GestureDetector>

        <View className="mt-4 flex-row items-center justify-between">
          <Pressable
            onPress={goPrev}
            disabled={index === 0}
            className="h-12 w-12 items-center justify-center rounded-full bg-bg-elevated border border-border"
          >
            <ChevronLeft color={index === 0 ? Colors.subtle : Colors.brand[500]} />
          </Pressable>

          <Link href={`/hospital/${card.slug}`} asChild>
            <Pressable className="flex-row items-center rounded-full bg-brand-500 px-5 py-3">
              <Text className="font-semibold text-white">Full profile</Text>
              <ExternalLink size={16} color="#fff" style={{ marginLeft: 8 }} />
            </Pressable>
          </Link>

          <Pressable
            onPress={goNext}
            disabled={index >= deck.length - 1}
            className="h-12 w-12 items-center justify-center rounded-full bg-bg-elevated border border-border"
          >
            <ChevronRight color={index >= deck.length - 1 ? Colors.subtle : Colors.brand[500]} />
          </Pressable>
        </View>

        <Text className="mt-3 text-center text-xs text-subtle">
          Swipe left/right or tap arrows · Tap ↻ on card to flip takeaways
        </Text>
      </View>
    </SafeAreaView>
  );
}
