import { useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, Send, Sparkles, Star, Target } from "lucide-react-native";
import { AppHeader } from "@/components/AppHeader";
import { HospitalMark } from "@/components/HospitalMark";
import { StarRow } from "@/components/metrics/StarRow";
import { askAssistantAsync, STARTER_PROMPTS, type ChatMessage } from "@/lib/assistant";
import { hospitalInsight } from "@/lib/insights";
import { Colors } from "@/constants/theme";

const PROMPT_CARDS = [
  {
    title: "CJR gaps",
    subtitle: "Top 50 with no outreach",
    prompt: STARTER_PROMPTS[0],
    icon: Target,
  },
  {
    title: "Texas 5★",
    subtitle: "Highest-rated in TX",
    prompt: STARTER_PROMPTS[1],
    icon: Star,
  },
  {
    title: "HACRP risk",
    subtitle: "Penalty hospitals in NY",
    prompt: STARTER_PROMPTS[2],
    icon: Sparkles,
  },
  {
    title: "Florida trip",
    subtitle: "Who to see at a conference",
    prompt: STARTER_PROMPTS[3],
    icon: MapPin,
  },
] as const;

export default function AskScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Ask who to see this week. I’ll brief TEAM hospitals in plain language — outreach gaps, CJR rank, quality flags — and drop battle cards you can open.",
      source: "local",
    },
  ]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const reply = await askAssistantAsync(trimmed);
      setMessages((prev) => [...prev, reply]);
    } finally {
      setLoading(false);
    }
  }

  const showPrompts = messages.length <= 1;

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 16 }}
        ListHeaderComponent={
          <View>
            <AppHeader title="Ask Stratus" subtitle="Field brief over the TEAM directory" />
            {showPrompts ? (
              <View className="mb-4">
                <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">Try a brief</Text>
                <View className="flex-row flex-wrap justify-between gap-y-3">
                  {PROMPT_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                      <Pressable
                        key={card.title}
                        onPress={() => send(card.prompt)}
                        className="w-[48%] rounded-[20px] border border-border bg-bg-elevated p-3"
                      >
                        <View className="mb-2 h-9 w-9 items-center justify-center rounded-2xl bg-brand-50">
                          <Icon size={16} color={Colors.brand[600]} />
                        </View>
                        <Text className="text-sm font-semibold text-fg">{card.title}</Text>
                        <Text className="mt-0.5 text-xs text-muted">{card.subtitle}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View className={`mb-3 max-w-[95%] ${item.role === "user" ? "self-end" : "self-start"}`}>
            <View
              className={`rounded-[20px] px-4 py-3 ${
                item.role === "user" ? "bg-brand-500" : "border border-border bg-bg-elevated"
              }`}
            >
              {item.role === "assistant" && item.source ? (
                <Text className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-brand-600">
                  {item.source === "ai" ? "Live brief" : item.source === "fallback" ? "Directory brief" : "Stratus"}
                </Text>
              ) : null}
              <Text className={`text-sm leading-6 ${item.role === "user" ? "text-white" : "text-fg"}`}>
                {item.text.replace(/\*\*/g, "")}
              </Text>
            </View>
            {item.hospitals?.length ? (
              <View className="mt-2 gap-2">
                {item.hospitals.map((h) => (
                  <Pressable
                    key={h.slug}
                    onPress={() => router.push(`/hospital/${h.slug}`)}
                    className="flex-row items-start gap-3 rounded-[16px] border border-border bg-bg-elevated px-3 py-3"
                  >
                    <HospitalMark name={h.name} seed={h.healthSystem ?? h.name} size="sm" />
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-fg" numberOfLines={1}>
                        {h.name}
                      </Text>
                      <View className="mt-1 flex-row items-center gap-2">
                        <StarRow value={h.overallRating} size={11} />
                        {h.teamRankByCjr != null ? (
                          <Text className="text-[11px] font-semibold text-brand-600">CJR #{h.teamRankByCjr}</Text>
                        ) : null}
                      </View>
                      <Text className="mt-1 text-xs leading-4 text-muted" numberOfLines={2}>
                        {hospitalInsight(h)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View className="mb-3 self-start rounded-[20px] border border-border bg-bg-elevated px-4 py-3">
              <View className="flex-row items-center gap-2">
                <ActivityIndicator color={Colors.brand[500]} />
                <Text className="text-sm text-muted">Writing a field brief…</Text>
              </View>
            </View>
          ) : null
        }
      />

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-bg px-4 pb-4 pt-3">
        <View className="flex-row items-end gap-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Who should I see in Florida?"
            placeholderTextColor={Colors.subtle}
            multiline
            className="max-h-[120px] min-h-[48px] flex-1 rounded-[18px] border border-border bg-bg-elevated px-4 py-3 text-fg"
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
          />
          <Pressable
            onPress={() => send(input)}
            disabled={loading}
            className={`h-12 w-12 items-center justify-center rounded-full ${loading ? "bg-brand-300" : "bg-brand-500"}`}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Send size={18} color="#fff" />}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
