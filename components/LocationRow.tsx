import { Pressable, Text, View } from "react-native";
import { ExternalLink, MapPin } from "lucide-react-native";
import { hospitalMapsQuery, openHospitalInMaps, type MappablePlace } from "@/lib/maps";
import { Colors } from "@/constants/theme";

export function LocationRow({ place }: { place: MappablePlace }) {
  return (
    <Pressable
      onPress={(event) => {
        event.stopPropagation?.();
        openHospitalInMaps(place);
      }}
      className="flex-row items-center gap-2 rounded-[14px] border border-border bg-bg-soft px-3 py-2"
    >
      <MapPin size={16} color={Colors.brand[500]} />
      <Text className="flex-1 text-sm text-muted" numberOfLines={1}>
        {hospitalMapsQuery(place)}
      </Text>
      <View className="flex-row items-center gap-1">
        <Text className="text-xs font-semibold text-brand-600">Maps</Text>
        <ExternalLink size={12} color={Colors.brand[500]} />
      </View>
    </Pressable>
  );
}
