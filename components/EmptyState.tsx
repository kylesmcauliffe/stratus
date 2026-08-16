import { Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Colors } from "@/constants/theme";

export function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <View className="items-center rounded-[24px] border border-border bg-bg-elevated px-6 py-10">
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
        <Icon size={22} color={Colors.brand[500]} />
      </View>
      <Text className="text-center text-base font-semibold text-fg">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-muted">{body}</Text>
    </View>
  );
}
