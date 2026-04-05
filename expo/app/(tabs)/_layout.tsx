import { Tabs } from "expo-router";
import { Home, MessageSquare, CalendarDays, User } from "lucide-react-native";
import React, { useRef, useEffect } from "react";
import { StyleSheet, View, Text, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

function TabIcon({
  Icon,
  color,
  focused,
  label,
}: {
  Icon: typeof Home;
  color: string;
  focused: boolean;
  label: string;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevFocused = useRef(focused);

  useEffect(() => {
    if (focused && !prevFocused.current) {
      scaleAnim.setValue(1);
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          speed: 60,
          bounciness: 15,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 40,
          bounciness: 10,
        }),
      ]).start();
    }
    prevFocused.current = focused;
  }, [focused, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.iconContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Icon color={color} size={21} strokeWidth={focused ? 2 : 1.4} />
      {focused && <View style={styles.glowDot} />}
      <Text
        style={[
          styles.tabLabel,
          {
            color: focused ? Colors.tabActive : Colors.tabInactive,
            fontWeight: focused ? ("600" as const) : ("400" as const),
          },
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomMargin = Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute" as const,
          bottom: bottomMargin,
          left: 16,
          right: 16,
          height: 66,
          backgroundColor: Colors.tabBar,
          borderTopWidth: 0,
          borderTopColor: "transparent",
          elevation: 12,
          borderRadius: 28,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          paddingBottom: 0,
          paddingHorizontal: 6,
          borderWidth: 0,
        },
        tabBarItemStyle: {
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "ホーム",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={Home} color={color} focused={focused} label="ホーム" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "チャット",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              Icon={MessageSquare}
              color={color}
              focused={focused}
              label="チャット"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "記録",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              Icon={CalendarDays}
              color={color}
              focused={focused}
              label="記録"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "プロフィール",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon Icon={User} color={color} focused={focused} label="プロフィール" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 50,
    gap: 3,
    position: "relative",
  },
  glowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.tabActive,
    position: "absolute",
    bottom: 0,
    shadowColor: Colors.tabActive,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 0.3,
  },
});
