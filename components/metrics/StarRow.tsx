import { View } from "react-native";
import { Star } from "lucide-react-native";
import { Colors } from "@/constants/theme";

interface StarRowProps {
  value: number | null;
  size?: number;
}

export function StarRow({ value, size = 14 }: StarRowProps) {
  const rating = value ?? 0;
  return (
    <View className="flex-row items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = rating >= i + 1;
        const half = !filled && rating >= i + 0.5;
        return (
          <Star
            key={i}
            size={size}
            color={filled || half ? Colors.brand[500] : Colors.paperBorder}
            fill={filled ? Colors.brand[500] : half ? Colors.brand[200] : "transparent"}
          />
        );
      })}
    </View>
  );
}
