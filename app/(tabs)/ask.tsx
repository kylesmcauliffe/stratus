import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { Chip } from "@/components/ui/Chip";
import { askAssistantAsync, STARTER_PROMPTS, type ChatMessage } from "@/lib/assistant";
import { Colors } from "@/constants/theme";

export default function AskScreen() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi — I'm Stratus. Ask about TEAM hospitals, outreach gaps, quality flags, or who to prioritize at your next event. On Netlify, answers use the AI gateway; offline, I fall back to on-device search.",
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

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 16 }}
        ListHeaderComponent={
          <View>
            <AppHeader
              title="Ask Stratus"
              subtitle="AI-assisted research over the TEAM directory (Netlify AI gateway on deploy)"
            />
            <ScrollChips onPick={send} />
          </View>
        }
        renderItem={({ item }) => (
          <View className={`mb-3 max-w-[95%] ${item.role === "user" ? "self-end" : "self-start"}`}>
            <View
              className={`rounded-[20px] px-4 py-3 ${
                item.role === "user" ? "bg-brand-500" : "bg-bg-elevated border border-border"
              }`}
            >
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
                    className="rounded-[14px] bg-brand-50 px-3 py-2 border border-brand-100"
                  >
                    <Text className="text-sm font-medium text-brand-700">{h.name}</Text>
                    <Text className="text-xs text-muted">{h.state} · open battle card</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        )}
        ListFooterComponent={
          <View className="pt-2 pb-24">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about hospitals, states, outreach…"
              placeholderTextColor={Colors.subtle}
              multiline
              className="min-h-[48px] rounded-[18px] bg-bg-elevated border border-border px-4 py-3 text-fg"
              onSubmitEditing={() => send(input)}
              returnKeyType="send"
            />
            <Pressable
              onPress={() => send(input)}
              disabled={loading}
              className={`mt-3 rounded-[16px] py-3 items-center ${loading ? "bg-brand-300" : "bg-brand-500"}`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="font-semibold text-white">Send</Text>
              )}
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function ScrollChips({ onPick }: { onPick: (text: string) => void }) {
  return (
    <View className="flex-row flex-wrap gap-2 mb-4">
      {STARTER_PROMPTS.map((prompt) => (
        <Chip key={prompt} label={prompt} onPress={() => onPick(prompt)} />
      ))}
    </View>
  );
}
