import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  X,
  Snowflake,
  Dumbbell,
  Phone,
  Footprints,
  Pencil,
  Droplets,
  Music,
  Brain,
  Wind,
  ShieldAlert,
  Timer,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { PANIC_TIPS, getRandomEmergencyQuote } from "@/constants/panic-tips";
import type { PanicTip } from "@/constants/panic-tips";



const ICON_MAP: Record<PanicTip["icon"], React.ComponentType<{ color: string; size: number; strokeWidth?: number }>> = {
  snowflake: Snowflake,
  dumbbell: Dumbbell,
  phone: Phone,
  footprints: Footprints,
  pencil: Pencil,
  droplets: Droplets,
  music: Music,
  brain: Brain,
};

const TIP_COLORS = [
  "#C0392B",
  "#E67E22",
  "#2980B9",
  "#27AE60",
  "#8E44AD",
  "#2C3E50",
  "#D35400",
  "#16A085",
];

export default function PanicScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [quote] = useState(getRandomEmergencyQuote);
  const [countdown, setCountdown] = useState(120);
  const [timerActive, setTimerActive] = useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const quoteSlide = useRef(new Animated.Value(30)).current;
  const tipAnims = useRef(PANIC_TIPS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(quoteSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    const stagger = tipAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 300 + i * 80,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, stagger).start();

    return () => {
      pulse.stop();
    };
  }, [fadeIn, pulseAnim, quoteSlide, tipAnims]);

  useEffect(() => {
    if (!timerActive) return;
    if (countdown <= 0) {
      setTimerActive(false);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  const handleClose = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleBreathing = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/breathing");
  }, [router]);

  const handleStartTimer = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCountdown(120);
    setTimerActive(true);
  }, []);

  const handleTipPress = useCallback((tip: PanicTip) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("[Panic] Tip tapped:", tip.id);
  }, []);

  const formatCountdown = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient
        colors={["#0A0000", "#120808", "#0A0A10"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.header, { opacity: fadeIn }]}>
        <Pressable
          style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.5 }]}
          onPress={handleClose}
          hitSlop={16}
          testID="panic-close"
        >
          <X color={Colors.textSecondary} size={20} strokeWidth={1.5} />
        </Pressable>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.heroSection, { opacity: fadeIn }]}>
          <Animated.View style={[styles.shieldCircle, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.shieldInner}>
              <ShieldAlert color="#C0392B" size={36} strokeWidth={1.5} />
            </View>
          </Animated.View>

          <Text style={styles.heroTitle}>衝動と闘え</Text>

          <Animated.View style={{ transform: [{ translateY: quoteSlide }], opacity: fadeIn }}>
            <Text style={styles.heroQuote}>「{quote}」</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.timerSection, { opacity: fadeIn }]}>
          {timerActive ? (
            <View style={styles.timerCard}>
              <Timer color="#E67E22" size={20} strokeWidth={1.5} />
              <Text style={styles.timerText}>
                衝動が去るまで: <Text style={styles.timerCount}>{formatCountdown(countdown)}</Text>
              </Text>
              <Text style={styles.timerHint}>衝動は通常2分以内に弱まる</Text>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.timerStartBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }]}
              onPress={handleStartTimer}
              testID="panic-timer"
            >
              <Timer color="#E67E22" size={18} strokeWidth={1.5} />
              <Text style={styles.timerStartText}>2分タイマーを開始</Text>
            </Pressable>
          )}
        </Animated.View>

        <View style={styles.quickActions}>
          <Pressable
            style={({ pressed }) => [styles.breatheBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }]}
            onPress={handleBreathing}
            testID="panic-breathe"
          >
            <Wind color="#4A90D9" size={20} strokeWidth={1.5} />
            <Text style={styles.breatheBtnText}>深呼吸を始める</Text>
          </Pressable>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>今すぐやれ</Text>

          <View style={styles.tipsGrid}>
            {PANIC_TIPS.map((tip, index) => {
              const IconComponent = ICON_MAP[tip.icon];
              const color = TIP_COLORS[index % TIP_COLORS.length];
              return (
                <Animated.View
                  key={tip.id}
                  style={[
                    styles.tipCardWrapper,
                    {
                      opacity: tipAnims[index],
                      transform: [
                        {
                          translateY: tipAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.tipCard,
                      pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
                    ]}
                    onPress={() => handleTipPress(tip)}
                  >
                    <View style={[styles.tipIconCircle, { backgroundColor: color + "18" }]}>
                      <IconComponent color={color} size={20} strokeWidth={1.5} />
                    </View>
                    <View style={styles.tipContent}>
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                      <Text style={styles.tipDesc}>{tip.description}</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12,
    zIndex: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 28,
  },
  shieldCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(192,57,43,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "rgba(192,57,43,0.2)",
    ...(Platform.OS !== "web"
      ? { shadowColor: "#C0392B", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20 }
      : {}),
  },
  shieldInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(192,57,43,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900" as const,
    color: Colors.text,
    letterSpacing: 2,
    marginBottom: 14,
  },
  heroQuote: {
    fontSize: 15,
    fontWeight: "300" as const,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 24,
    paddingHorizontal: 16,
    fontStyle: "italic" as const,
  },
  timerSection: {
    marginBottom: 16,
  },
  timerCard: {
    backgroundColor: "rgba(230,126,34,0.08)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 0.5,
    borderColor: "rgba(230,126,34,0.2)",
  },
  timerText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  timerCount: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: "#E67E22",
  },
  timerHint: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "300" as const,
  },
  timerStartBtn: {
    backgroundColor: "rgba(230,126,34,0.08)",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 0.5,
    borderColor: "rgba(230,126,34,0.2)",
  },
  timerStartText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#E67E22",
    letterSpacing: 0.3,
  },
  quickActions: {
    marginBottom: 28,
  },
  breatheBtn: {
    backgroundColor: "rgba(74,144,217,0.08)",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 0.5,
    borderColor: "rgba(74,144,217,0.2)",
  },
  breatheBtnText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#4A90D9",
    letterSpacing: 0.3,
  },
  tipsSection: {
    gap: 14,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    letterSpacing: 1,
  },
  tipsGrid: {
    gap: 10,
  },
  tipCardWrapper: {
    width: "100%",
  },
  tipCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
  },
  tipIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
    gap: 4,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  tipDesc: {
    fontSize: 13,
    fontWeight: "300" as const,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
