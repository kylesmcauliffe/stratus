import { Text, View } from "react-native";
import { siteConfig, Colors } from "@/constants/theme";

export function AppHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center gap-3 mb-3">
        <View className="rounded-2xl bg-brand-500 px-3 py-2">
          <Text className="text-sm font-bold text-white">Rainfall</Text>
        </View>
        <View className="rounded-full bg-brand-50 px-3 py-1">
          <Text className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: Colors.brand[700] }}>
            Internal
          </Text>
        </View>
      </View>
      <Text className="text-3xl font-bold text-fg">{title ?? siteConfig.name}</Text>
      <Text className="mt-1 text-base text-muted">{subtitle ?? siteConfig.tagline}</Text>
    </View>
  );
}
