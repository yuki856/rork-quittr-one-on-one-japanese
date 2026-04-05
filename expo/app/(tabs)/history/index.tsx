import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Colors, { getStreakColor } from "@/constants/colors";
import { useStreak } from "@/providers/StreakProvider";
import { getDaysInMonth, getFirstDayOfMonth, formatDate } from "@/utils/time";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { startDate, relapses, currentStreak, longestStreak } = useStreak();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const relapseDates = useMemo(() => {
    return new Set(
      relapses.map((r) => {
        const d = new Date(r.date);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );
  }, [relapses]);

  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days: Array<{ day: number; status: "clean" | "relapse" | "future" | "before" | null }> = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, status: null });
    }

    const streakStart = new Date(startDate);
    const today = new Date();

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const dateKey = `${viewYear}-${viewMonth}-${d}`;

      if (date > today) {
        days.push({ day: d, status: "future" });
      } else if (date < new Date(streakStart.getFullYear(), streakStart.getMonth(), streakStart.getDate()) && relapses.length === 0) {
        days.push({ day: d, status: "before" });
      } else if (relapseDates.has(dateKey)) {
        days.push({ day: d, status: "relapse" });
      } else if (date >= new Date(streakStart.getFullYear(), streakStart.getMonth(), streakStart.getDate())) {
        days.push({ day: d, status: "clean" });
      } else {
        let isCleanDay = false;
        for (let i = relapses.length - 1; i >= 0; i--) {
          const relapseDate = new Date(relapses[i].date);
          const nextRelapse = i > 0 ? new Date(relapses[i - 1].date) : today;
          if (date >= relapseDate && date <= nextRelapse) {
            isCleanDay = !relapseDates.has(dateKey);
            break;
          }
        }
        days.push({ day: d, status: isCleanDay ? "clean" : "before" });
      }
    }

    return days;
  }, [viewYear, viewMonth, startDate, relapses, relapseDates]);

  const stats = useMemo(() => {
    const totalClean = calendarData.filter((d) => d.status === "clean").length;
    const avgStreak =
      relapses.length > 0
        ? Math.round(
            relapses.reduce((sum, r) => sum + r.streakBefore, 0) /
              relapses.length
          )
        : currentStreak;
    return { totalClean, avgStreak };
  }, [calendarData, relapses, currentStreak]);

  const prevMonth = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundEnd]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>記録</Text>
        <View style={styles.headerLine} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.monthNav}>
          <Pressable
            onPress={prevMonth}
            hitSlop={12}
            testID="history-prev"
            style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.5 }]}
          >
            <ChevronLeft color={Colors.textSecondary} size={20} strokeWidth={1.5} />
          </Pressable>
          <Text style={styles.monthText}>
            {viewYear}年 {viewMonth + 1}月
          </Text>
          <Pressable
            onPress={nextMonth}
            hitSlop={12}
            testID="history-next"
            style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.5 }]}
          >
            <ChevronRight color={Colors.textSecondary} size={20} strokeWidth={1.5} />
          </Pressable>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <Text key={day} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarData.map((item, index) => (
              <View key={index} style={styles.dayCell}>
                {item.day > 0 ? (
                  <View
                    style={[
                      styles.dayCircle,
                      item.status === "clean" && styles.cleanDay,
                      item.status === "relapse" && styles.relapseDay,
                      item.status === "future" && styles.futureDay,
                      item.status === "before" && styles.beforeDay,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        item.status === "clean" && styles.cleanDayText,
                        item.status === "relapse" && styles.relapseDayText,
                        item.status === "future" && styles.futureDayText,
                      ]}
                    >
                      {item.day}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.cleanDay }]} />
              <Text style={styles.legendText}>クリーン</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.relapseDay }]} />
              <Text style={styles.legendText}>リラプス</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getStreakColor(currentStreak) }]}>
                {currentStreak}日
              </Text>
              <Text style={styles.statLabel}>現在の連続</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{longestStreak}日</Text>
              <Text style={styles.statLabel}>最長記録</Text>
            </View>
          </View>
          <View style={styles.statsRowDivider} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.avgStreak}日</Text>
              <Text style={styles.statLabel}>平均連続</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalClean}日</Text>
              <Text style={styles.statLabel}>今月クリーン</Text>
            </View>
          </View>
        </View>

        {relapses.length > 0 && (
          <View style={styles.relapseList}>
            <Text style={styles.sectionTitle}>リラプス履歴</Text>
            {relapses.slice(0, 20).map((r) => (
              <View key={r.id} style={styles.relapseItem}>
                <View style={styles.relapseDot} />
                <View style={styles.relapseInfo}>
                  <Text style={styles.relapseDate}>{formatDate(r.date)}</Text>
                  <Text style={styles.relapseStreak}>
                    {r.streakBefore}日後にリラプス
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  headerLine: {
    height: 0.5,
    backgroundColor: Colors.glassBorder,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.glass,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  calendarCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
    ...(Platform.OS !== "web"
      ? { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }
      : {}),
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center" as const,
    fontSize: 11,
    fontWeight: "400" as const,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cleanDay: {
    backgroundColor: "rgba(139, 0, 0, 0.2)",
  },
  relapseDay: {
    backgroundColor: "rgba(68, 68, 68, 0.35)",
  },
  futureDay: {
    opacity: 0.25,
  },
  beforeDay: {
    opacity: 0.12,
  },
  dayText: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: Colors.textSecondary,
  },
  cleanDayText: {
    color: Colors.cleanDay,
    fontWeight: "600" as const,
  },
  relapseDayText: {
    color: Colors.relapseDay,
    fontWeight: "600" as const,
  },
  futureDayText: {
    color: Colors.textDim,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: Colors.glassBorder,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "400" as const,
    letterSpacing: 0.3,
  },
  statsCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: 22,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
    ...(Platform.OS !== "web"
      ? { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }
      : {}),
  },
  statsRow: {
    flexDirection: "row",
  },
  statsRowDivider: {
    height: 0.5,
    backgroundColor: Colors.glassBorder,
    marginVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  statDivider: {
    width: 0.5,
    height: 36,
    backgroundColor: Colors.glassBorder,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "400" as const,
    letterSpacing: 0.5,
  },
  relapseList: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  relapseItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.glass,
    borderRadius: 14,
    padding: 16,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  relapseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.relapseDay,
  },
  relapseInfo: {
    flex: 1,
  },
  relapseDate: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  relapseStreak: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 3,
    fontWeight: "300" as const,
  },
});
