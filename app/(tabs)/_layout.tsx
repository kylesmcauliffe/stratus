import { Tabs } from "expo-router";
import { Bookmark, GitCompare, Home, Layers, Map, MessageCircle } from "lucide-react-native";
import { Colors } from "@/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.brand[500],
        tabBarInactiveTintColor: Colors.subtle,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e2e8f0",
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="map" options={{ title: "Map", tabBarIcon: ({ color, size }) => <Map color={color} size={size} /> }} />
      <Tabs.Screen name="deck" options={{ title: "Deck", tabBarIcon: ({ color, size }) => <Layers color={color} size={size} /> }} />
      <Tabs.Screen name="compare" options={{ title: "Compare", tabBarIcon: ({ color, size }) => <GitCompare color={color} size={size} /> }} />
      <Tabs.Screen name="ask" options={{ title: "Ask", tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }} />
      <Tabs.Screen name="saved" options={{ title: "Saved", tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size} /> }} />
      <Tabs.Screen name="log" options={{ href: null }} />
    </Tabs>
  );
}
