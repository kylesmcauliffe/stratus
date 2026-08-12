import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { addConferenceLog, getConferenceLogs, type ConferenceLog } from "@/lib/storage";

export default function LogScreen() {
  const [logs, setLogs] = useState<ConferenceLog[]>([]);
  const [hospitalName, setHospitalName] = useState("");
  const [contactName, setContactName] = useState("");
  const [note, setNote] = useState("");

  useFocusEffect(
    useCallback(() => {
      void getConferenceLogs().then(setLogs);
    }, []),
  );

  async function handleSave() {
    if (!note.trim()) return;
    await addConferenceLog({
      hospitalName: hospitalName.trim() || undefined,
      contactName: contactName.trim() || undefined,
      note: note.trim(),
    });
    setHospitalName("");
    setContactName("");
    setNote("");
    setLogs(await getConferenceLogs());
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 112, paddingTop: 16 }}
        ListHeaderComponent={
          <View>
            <AppHeader
              title="Conference log"
              subtitle="Capture quick notes from events, booths, and hallway conversations"
            />

            <View className="rounded-[24px] bg-bg-elevated border border-border p-4 mb-5">
              <Text className="text-sm font-semibold text-fg mb-3">New entry</Text>
              <TextInput
                value={hospitalName}
                onChangeText={setHospitalName}
                placeholder="Hospital or system"
                placeholderTextColor="#94a3b8"
                className="mb-3 rounded-[16px] bg-bg-soft px-4 py-3 text-fg border border-border"
              />
              <TextInput
                value={contactName}
                onChangeText={setContactName}
                placeholder="Contact name (optional)"
                placeholderTextColor="#94a3b8"
                className="mb-3 rounded-[16px] bg-bg-soft px-4 py-3 text-fg border border-border"
              />
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="What happened? Next steps?"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="mb-4 min-h-[100px] rounded-[16px] bg-bg-soft px-4 py-3 text-fg border border-border"
              />
              <Pressable onPress={handleSave} className="rounded-[16px] bg-brand-500 py-3 items-center">
                <Text className="font-semibold text-white">Save note</Text>
              </Pressable>
            </View>

            <Text className="text-sm font-semibold text-muted mb-3">Recent notes</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="rounded-[24px] bg-bg-soft border border-border p-5">
            <Text className="text-sm text-muted">Notes you save will appear here — stored on this device.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="rounded-[20px] bg-bg-elevated border border-border p-4 mb-3">
            <Text className="text-xs text-subtle">
              {new Date(item.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Text>
            {item.hospitalName ? (
              <Text className="mt-1 text-base font-semibold text-fg">{item.hospitalName}</Text>
            ) : null}
            {item.contactName ? <Text className="text-sm text-muted">{item.contactName}</Text> : null}
            <Text className="mt-2 text-sm leading-6 text-muted">{item.note}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
