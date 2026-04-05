import { Tabs } from "expo-router";
import { Home, MessageCircle, CalendarDays, UserCircle } from "lucide-react-native";
import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated, Pressable, Platform } from "react-native";
import * as Haptics from "expo-haptics";


interface TabBarIconProps {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
}

function TabBarItem({ icon, label, focused }: TabBarIconProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[styles.tabItem, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        {icon}
      </View>
      <Text style={[styles.tabLabel, focused ? styles.tabLabelActive : styles.tabLabelInactive]}>
        {label}
      </Text>
      {focused && <View style={styles.activeDot} />}
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#666666",
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "ホーム",
          tabBarIcon: ({ color, focused }) => (
            <TabBarItem
              icon={<Home color={color} size={22} strokeWidth={focused ? 2 : 1.5} />}
              label="ホーム"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "チャット",
          tabBarIcon: ({ color, focused }) => (
            <TabBarItem
              icon={<MessageCircle color={color} size={22} strokeWidth={focused ? 2 : 1.5} />}
              label="チャット"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "記録",
          tabBarIcon: ({ color, focused }) => (
            <TabBarItem
              icon={<CalendarDays color={color} size={22} strokeWidth={focused ? 2 : 1.5} />}
              label="記録"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "プロフィール",
          tabBarIcon: ({ color, focused }) => (
            <TabBarItem
              icon={<UserCircle color={color} size={22} strokeWidth={focused ? 2 : 1.5} />}
              label="プロフィール"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const scaleAnims = useRef(state.routes.map(() => new Animated.Value(1))).current;

  return (
    <View style={styles.tabBarOuter}>
      <View style={styles.tabBarPill}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;

          const onPress = () => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Animated.sequence([
              Animated.timing(scaleAnims[index], { toValue: 1.15, duration: 100, useNativeDriver: true }),
              Animated.spring(scaleAnims[index], { toValue: 1, friction: 4, useNativeDriver: true }),
            ]).start();

            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tabPressable}>
              <Animated.View style={{ transform: [{ scale: scaleAnims[index] }] }}>
                {options.tabBarIcon?.({
                  color: focused ? "#FFFFFF" : "#666666",
                  focused,
                  size: 22,
                })}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    display: "none",
  },
  tabBarOuter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    alignItems: "center",
  },
  tabBarPill: {
    flexDirection: "row",
    backgroundColor: "#1C1C1E",
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 8,
    ...Platform.select({
      web: {
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 20,
      },
    }),
  },
  tabPressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: "#FFFFFF",
    fontWeight: "500" as const,
  },
  tabLabelInactive: {
    color: "#666666",
    fontWeight: "400" as const,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C0392B",
    marginTop: 2,
  },
});
