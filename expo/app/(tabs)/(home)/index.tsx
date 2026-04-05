import React, { useEffect, useState, useRef, useCallback } from "react";
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
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Wind, RotateCcw, Trophy, Flame, Calendar } from "lucide-react-native";
import Colors, { getStreakColor, getStreakGlow } from "@/constants/colors";
import { useStreak } from "@/providers/StreakProvider";
import { formatDate } from "@/utils/time";
import GlassDialog from "@/components/GlassDialog";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    currentStreak,
    longestStreak,
    totalRelapses,
    startDate,
    relapse,
  } = useStreak();

  const [displayStreak, setDisplayStreak] = useState(currentStreak);
  const [showRelapseDialog, setShowRelapseDialog] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const buttonScaleRelapse = useRef(new Animated.Value(1)).current;
  const buttonScaleBreath = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setDisplayStreak(currentStreak);
  }, [currentStreak]);

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [fadeIn, pulseAnim, glowAnim]);

  useEffect(() => {
    const interval = setInterval(() => {
      const start = new Date(startDate);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      setDisplayStreak(days);
    }, 60000);
    return () => clearInterval(interval);
  }, [startDate]);

  const streakColor = getStreakColor(displayStreak);
  const streakGlow = getStreakGlow(displayStreak);

  const animateButton = useCallback((anim: Animated.Value, callback: () => void) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    callback();
  }, []);

  const handleRelapse = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowRelapseDialog(true);
  }, []);

  const confirmRelapse = useCallback(() => {
    setShowRelapseDialog(false);
    relapse();
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning
    );
  }, [relapse]);

  const handleBreathing = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/breathing");
  }, [router]);

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundEnd]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeIn }]}>
          <Text style={styles.headerLabel}>クリーン日数</Text>

          <View style={styles.streakOuter}>
            <Animated.View
              style={[
                styles.streakGlowBg,
                {
                  opacity: glowAnim,
                  backgroundColor: streakGlow,
                  shadowColor: streakColor,
                },
              ]}
            />

            <Animated.View
              style={[
                styles.streakContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.ringOuter}>
                <LinearGradient
                  colors={[streakColor + "CC", streakColor + "33"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ringGradient}
                >
                  <View style={styles.ringInner}>
                    <Text
                      style={[
                        styles.streakNumber,
                        {
                          color: streakColor,
                          textShadowColor: streakColor + "80",
                          textShadowOffset: { width: 0, height: 0 },
                          textShadowRadius: 20,
                        },
                      ]}
                      testID="streak-number"
                    >
                      {displayStreak}
                    </Text>
                    <Text style={styles.streakUnit}>日</Text>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Trophy color={Colors.textSecondary} size={16} strokeWidth={1.5} />
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>最長記録</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Flame color={Colors.textSecondary} size={16} strokeWidth={1.5} />
              <Text style={styles.statValue}>{totalRelapses}</Text>
              <Text style={styles.statLabel}>リラプス</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Calendar color={Colors.textSecondary} size={16} strokeWidth={1.5} />
              <Text style={styles.statValue}>{formatDate(startDate)}</Text>
              <Text style={styles.statLabel}>開始日</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <Animated.View style={[styles.actionFlex, { transform: [{ scale: buttonScaleRelapse }] }]}>
              <Pressable
                style={styles.glassButton}
                onPress={() => animateButton(buttonScaleRelapse, handleRelapse)}
                testID="relapse-button"
              >
                <RotateCcw color={Colors.danger} size={18} strokeWidth={1.5} />
                <Text style={styles.relapseButtonText}>リラプス</Text>
              </Pressable>
            </Animated.View>

            <Animated.View style={[styles.actionFlex, { transform: [{ scale: buttonScaleBreath }] }]}>
              <Pressable
                style={styles.glassButton}
                onPress={() => animateButton(buttonScaleBreath, handleBreathing)}
                testID="breathing-button"
              >
                <Wind color={Colors.blue} size={18} strokeWidth={1.5} />
                <Text style={styles.breathingButtonText}>深呼吸</Text>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>
      <GlassDialog
        visible={showRelapseDialog}
        title="確認"
        message="本当にリセットするのか？"
        buttons={[
          { text: "キャンセル", style: "cancel", onPress: () => setShowRelapseDialog(false) },
          { text: "リセット", style: "destructive", onPress: confirmRelapse },
        ]}
        onClose={() => setShowRelapseDialog(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  content: {
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: "300" as const,
    color: Colors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 4,
    marginBottom: 40,
  },
  streakOuter: {
    marginBottom: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  streakGlowBg: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    ...(Platform.OS !== "web"
      ? { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 60 }
      : {}),
  },
  streakContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringOuter: {
    width: 210,
    height: 210,
    borderRadius: 105,
    padding: 3,
  },
  ringGradient: {
    flex: 1,
    borderRadius: 105,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  ringInner: {
    flex: 1,
    width: "100%",
    borderRadius: 105,
    backgroundColor: "rgba(10,10,10,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  streakNumber: {
    fontSize: 84,
    fontWeight: "900" as const,
    lineHeight: 92,
  },
  streakUnit: {
    fontSize: 16,
    fontWeight: "300" as const,
    color: Colors.textSecondary,
    marginTop: -4,
    letterSpacing: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.glass,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    paddingVertical: 22,
    paddingHorizontal: 8,
    marginBottom: 32,
    width: "100%",
    ...(Platform.OS !== "web"
      ? { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }
      : {}),
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  statDivider: {
    width: 0.5,
    height: 36,
    backgroundColor: Colors.glassBorder,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "400" as const,
    letterSpacing: 0.5,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionFlex: {
    flex: 1,
  },
  glassButton: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 18,
  },
  relapseButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.danger,
    letterSpacing: 0.5,
  },
  breathingButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.blue,
    letterSpacing: 0.5,
  },
});
