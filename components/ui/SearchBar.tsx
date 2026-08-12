import { Pressable, Text, TextInput, View } from "react-native";
import { Search, X } from "lucide-react-native";
import { Colors } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = "Search hospitals, systems, states…" }: SearchBarProps) {
  return (
    <View className="flex-row items-center rounded-[20px] bg-bg-elevated px-4 py-3 shadow-sm border border-border">
      <Search size={20} color={Colors.subtle} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.subtle}
        className="ml-3 flex-1 text-base text-fg"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <X size={18} color={Colors.subtle} />
        </Pressable>
      ) : null}
    </View>
  );
}
