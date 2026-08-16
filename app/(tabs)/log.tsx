import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Building2, NotebookPen, StickyNote, User } from "lucide-react-native";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { addConferenceLog, getConferenceLogs, type ConferenceLog } from "@/lib/storage";
import { Colors } from "@/constants/theme";

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
              subtitle="Capture booth and hallway notes before they disappear"
            />

            <View className="mb-5 rounded-[24px] border border-border bg-bg-elevated p-4">
              <View className="mb-3 flex-row items-center gap-2">
                <NotebookPen size={16} color={Colors.brand[500]} />
                <Text className="text-sm font-semibold text-fg">New entry</Text>
              </View>
              <View className="mb-3 flex-row items-center rounded-[16px] border border-border bg-bg-soft px-3">
                <Building2 size={16} color={Colors.subtle} />
                <TextInput
                  value={hospitalName}
                  onChangeText={setHospitalName}
                  placeholder="Hospital or system"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 px-3 py-3 text-fg"
                />
              </View>
              <View className="mb-3 flex-row items-center rounded-[16px] border border-border bg-bg-soft px-3">
                <User size={16} color={Colors.subtle} />
                <TextInput
                  value={contactName}
                  onChangeText={setContactName}
                  placeholder="Contact name (optional)"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 px-3 py-3 text-fg"
                />
              </View>
              <View className="mb-4 flex-row items-start rounded-[16px] border border-border bg-bg-soft px-3">
                <StickyNote size={16} color={Colors.subtle} style={{ marginTop: 14 }} />
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="What happened? Next steps?"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="min-h-[100px] flex-1 px-3 py-3 text-fg"
                />
              </View>
              <Pressable onPress={handleSave} className="items-center rounded-[16px] bg-brand-500 py-3">
                <Text className="font-semibold text-white">Save note</Text>
              </Pressable>
            </View>

            <Text className="mb-3 text-sm font-semibold text-muted">Recent notes</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={NotebookPen}
            title="No notes yet"
            body="Log a hallway conversation here. Notes stay on this device."
          />
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-[20px] border border-border bg-bg-elevated p-4">
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
