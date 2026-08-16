import { Pressable, Text, View, type PressableProps } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Colors } from "@/constants/theme";

interface ChipProps extends PressableProps {
  label: string;
  active?: boolean;
  icon?: LucideIcon;
}

export function Chip({ label, active, icon: Icon, className, ...props }: ChipProps & { className?: string }) {
  return (
    <Pressable
      {...props}
      className={`flex-row items-center gap-1.5 rounded-full px-3.5 py-2 ${active ? "bg-brand-500" : "border border-border bg-bg-elevated"} ${className ?? ""}`}
    >
      {Icon ? <Icon size={14} color={active ? "#fff" : Colors.brand[500]} /> : null}
      <Text className={`text-sm font-medium ${active ? "text-white" : "text-muted"}`}>{label}</Text>
    </Pressable>
  );
}

interface MetricPillProps {
  label: string;
  value: string;
  tone?: "good" | "warn" | "neutral";
}

export function MetricPill({ label, value, tone = "neutral" }: MetricPillProps) {
  const toneClass =
    tone === "good" ? "bg-emerald-50 text-good" : tone === "warn" ? "bg-amber-50 text-warn" : "bg-bg-soft text-muted";
  return (
    <View className={`rounded-2xl px-3 py-2 ${toneClass.split(" ")[0]}`}>
      <Text className="text-[11px] uppercase tracking-wide text-subtle">{label}</Text>
      <Text className={`text-base font-semibold ${toneClass.split(" ").slice(1).join(" ")}`}>{value}</Text>
    </View>
  );
}
