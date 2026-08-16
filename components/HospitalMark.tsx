import { Text, View } from "react-native";

const MARK_PALETTE = ["#1f58c4", "#1a469f", "#2b72e6", "#18336b", "#0f766e", "#1e3a8a", "#0369a1"];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function hospitalInitials(name: string): string {
  const cleaned = name
    .replace(/\b(hospital|medical|center|health|the|of|and|system|regional|university)\b/gi, " ")
    .replace(/[^a-zA-Z\s]/g, " ")
    .trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  if (words[0] && words[0].length >= 2) return words[0].slice(0, 2).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function hospitalMarkColor(seed: string): string {
  return MARK_PALETTE[hashString(seed) % MARK_PALETTE.length] ?? MARK_PALETTE[0];
}

interface HospitalMarkProps {
  name: string;
  seed?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE = { sm: 36, md: 48, lg: 56 } as const;
const FONT = { sm: 12, md: 16, lg: 18 } as const;

export function HospitalMark({ name, seed, size = "md" }: HospitalMarkProps) {
  const dim = SIZE[size];
  return (
    <View
      className="items-center justify-center rounded-2xl"
      style={{ width: dim, height: dim, backgroundColor: hospitalMarkColor(seed ?? name) }}
    >
      <Text className="font-bold text-white" style={{ fontSize: FONT[size] }}>
        {hospitalInitials(name)}
      </Text>
    </View>
  );
}
