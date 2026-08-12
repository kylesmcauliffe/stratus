import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AppHeader } from "@/components/AppHeader";
import { CompareRadarChart } from "@/components/CompareRadarChart";
import { Chip } from "@/components/ui/Chip";
import { buildCompareRadarData } from "@/src/lib/compare-radar-metrics";
import { directoryHospitals, getDirectoryHospital } from "@/src/lib/directory-index";
import { Colors } from "@/constants/theme";

export default function CompareScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [showChart, setShowChart] = useState(true);

  const hospitals = useMemo(
    () => selected.map((slug) => getDirectoryHospital(slug)).filter(Boolean),
    [selected],
  ) as NonNullable<ReturnType<typeof getDirectoryHospital>>[];

  const radar = useMemo(() => buildCompareRadarData(hospitals), [hospitals]);

  const suggestions = useMemo(() => directoryHospitals.slice(0, 12), []);

  function toggleSlug(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 3) return prev;
      return [...prev, slug];
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 112, paddingTop: 16 }}>
        <AppHeader
          title="Compare"
          subtitle="Pick 2–3 hospitals for side-by-side metrics and radar chart"
        />

        <View className="flex-row gap-2 mb-4">
          <Chip label="Table" active={!showChart} onPress={() => setShowChart(false)} />
          <Chip label="Radar" active={showChart} onPress={() => setShowChart(true)} />
        </View>

        {selected.length > 0 ? (
          <View className="rounded-[24px] bg-bg-elevated border border-border p-4 mb-4">
            <Text className="text-sm font-semibold text-muted mb-3">Selected ({selected.length}/3)</Text>
            {hospitals.map((h) => (
              <Pressable key={h.slug} onPress={() => router.push(`/hospital/${h.slug}`)} className="mb-2">
                <Text className="text-base font-semibold text-brand-700">{h.name}</Text>
                <Text className="text-xs text-subtle">{h.state} · CJR #{h.teamRankByCjr ?? "—"} · {h.overallRating ?? "—"}★</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setSelected([])} className="mt-2">
              <Text className="text-sm text-warn font-medium">Clear selection</Text>
            </Pressable>
          </View>
        ) : null}

        {showChart && radar ? (
          <View className="items-center rounded-[24px] bg-bg-elevated border border-border p-4 mb-4">
            <CompareRadarChart data={radar} />
            <View className="mt-3 gap-1">
              {radar.labels.map((label, i) => (
                <Text key={label} className="text-xs text-muted" style={{ color: [Colors.brand[700], Colors.brand[500], "#7ec8e8"][i] }}>
                  ● {label}
                </Text>
              ))}
            </View>
          </View>
        ) : null}

        {!showChart && hospitals.length >= 2 ? (
          <View className="rounded-[24px] bg-bg-elevated border border-border overflow-hidden mb-4">
            <View className="flex-row border-b border-border bg-bg-soft px-3 py-2">
              <Text className="flex-1 text-xs font-semibold text-muted">Metric</Text>
              {hospitals.map((h) => (
                <Text key={h.slug} className="w-20 text-xs font-semibold text-muted" numberOfLines={1}>
                  {h.state}
                </Text>
              ))}
            </View>
            {(
              [
                ["CMS ★", (h: (typeof hospitals)[0]) => String(h.overallRating ?? "—")],
                ["MSPB", (h: (typeof hospitals)[0]) => h.mspbScore?.toFixed(2) ?? "—"],
                ["HVBP", (h: (typeof hospitals)[0]) => (h.hvbpTps != null ? String(Math.round(h.hvbpTps)) : "—")],
                ["CJR", (h: (typeof hospitals)[0]) => (h.teamRankByCjr != null ? `#${h.teamRankByCjr}` : "—")],
                ["Beds", (h: (typeof hospitals)[0]) => h.beds?.toLocaleString("en-US") ?? "—"],
                ["TCV", (h: (typeof hospitals)[0]) => (h.estTcv != null ? `$${(h.estTcv / 1e6).toFixed(1)}M` : "—")],
              ] as const
            ).map(([label, getter]) => (
              <View key={label} className="flex-row border-b border-border px-3 py-2">
                <Text className="flex-1 text-sm text-muted">{label}</Text>
                {hospitals.map((h) => (
                  <Text key={h.slug} className="w-20 text-sm font-medium text-fg">
                    {getter(h)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        <Text className="text-sm font-semibold text-muted mb-2">Add hospitals</Text>
        <View className="flex-row flex-wrap gap-2">
          {suggestions.map((h) => {
            const active = selected.includes(h.slug);
            return (
              <Chip
                key={h.slug}
                label={h.state + " · " + h.name.slice(0, 18)}
                active={active}
                onPress={() => toggleSlug(h.slug)}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
