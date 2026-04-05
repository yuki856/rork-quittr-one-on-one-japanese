import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { X } from "lucide-react-native";
import Colors from "@/constants/colors";
import { getRandomQuote } from "@/constants/quotes";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CIRCLE_MIN = 80;
const CIRCLE_MAX = SCREEN_WIDTH * 0.55;

const INHALE_DURATION = 4000;
const HOLD_DURATION = 4000;
const EXHALE_DURATION = 6000;
const TOTAL_CYCLES = 5;

type Phase = "inhale" | "hold" | "exhale" | "done";

const PHASE_LABELS: Record<Phase, string> = {
  inhale: "吸う",
  hold: "止める",
  exhale: "吐く",
  done: "",
};

export default function BreathingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("inhale");
  const [cycle, setCycle] = useState(1);
  const [quote, setQuote] = useState("");
  const circleSize = useRef(new Animated.Value(CIRCLE_MIN)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const quoteOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.2)).current;
  const isRunning = useRef(true);

  const runBreathingCycle = useCallback(
    (currentCycle: number) => {
      if (!isRunning.current) return;

      setPhase("inhale");
      setCycle(currentCycle);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      Animated.parallel([
        Animated.timing(circleSize, {
          toValue: CIRCLE_MAX,
          duration: INHALE_DURATION,
          useNativeDriver: false,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.6,
          duration: INHALE_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isRunning.current) return;

        setPhase("hold");
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        setTimeout(() => {
          if (!isRunning.current) return;

          setPhase("exhale");
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

          Animated.parallel([
            Animated.timing(circleSize, {
              toValue: CIRCLE_MIN,
              duration: EXHALE_DURATION,
              useNativeDriver: false,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.2,
              duration: EXHALE_DURATION,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (!isRunning.current) return;

            if (currentCycle < TOTAL_CYCLES) {
              runBreathingCycle(currentCycle + 1);
            } else {
              setPhase("done");
              setQuote(getRandomQuote());
              void Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              Animated.timing(quoteOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
              }).start();
            }
          });
        }, HOLD_DURATION);
      });
    },
    [circleSize, quoteOpacity, glowOpacity]
  );

  useEffect(() => {
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      runBreathingCycle(1);
    }, 500);

    return () => {
      isRunning.current = false;
      clearTimeout(timer);
    };
  }, [textOpacity, runBreathingCycle]);

  const handleClose = useCallback(() => {
    isRunning.current = false;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  return (
    <LinearGradient
      colors={["#050508", "#0A0A10", "#050508"]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <Pressable
        style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.5 }]}
        onPress={handleClose}
        hitSlop={16}
        testID="breathing-close"
      >
        <X color={Colors.textSecondary} size={20} strokeWidth={1.5} />
      </Pressable>

      {phase !== "done" ? (
        <Animated.View style={[styles.centerContent, { opacity: textOpacity }]}>
          <Text style={styles.cycleText}>
            {cycle} / {TOTAL_CYCLES}
          </Text>

          <View style={styles.circleWrapper}>
            <Animated.View
              style={[
                styles.circleGlow,
                {
                  opacity: glowOpacity,
                  width: CIRCLE_MAX + 80,
                  height: CIRCLE_MAX + 80,
                  borderRadius: (CIRCLE_MAX + 80) / 2,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.circle,
                {
                  width: circleSize,
                  height: circleSize,
                  borderRadius: CIRCLE_MAX / 2,
                },
              ]}
            />
          </View>

          <Text style={styles.phaseText}>{PHASE_LABELS[phase]}</Text>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.doneContent, { opacity: quoteOpacity }]}>
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>「{quote}」</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.doneButton,
              pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
            ]}
            onPress={handleClose}
            testID="breathing-done"
          >
            <Text style={styles.doneButtonText}>戻る</Text>
          </Pressable>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: "absolute" as const,
    top: 56,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cycleText: {
    fontSize: 13,
    fontWeight: "300" as const,
    color: Colors.textMuted,
    letterSpacing: 4,
    marginBottom: 60,
  },
  circleWrapper: {
    width: CIRCLE_MAX + 80,
    height: CIRCLE_MAX + 80,
    justifyContent: "center",
    alignItems: "center",
  },
  circleGlow: {
    position: "absolute",
    backgroundColor: "rgba(74, 144, 217, 0.08)",
    ...(Platform.OS !== "web"
      ? { shadowColor: "#4A90D9", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 40 }
      : {}),
  },
  circle: {
    backgroundColor: "rgba(74, 144, 217, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(74, 144, 217, 0.3)",
    overflow: "hidden" as const,
  },
  phaseText: {
    fontSize: 26,
    fontWeight: "200" as const,
    color: Colors.text,
    marginTop: 60,
    letterSpacing: 10,
  },
  doneContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
  },
  quoteContainer: {
    marginBottom: 60,
    paddingHorizontal: 16,
  },
  quoteText: {
    fontSize: 21,
    fontWeight: "400" as const,
    color: Colors.text,
    textAlign: "center" as const,
    lineHeight: 36,
    letterSpacing: 1,
  },
  doneButton: {
    backgroundColor: Colors.glass,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
    letterSpacing: 1,
  },
});
