import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  LogOut,
  Target,
  User,
  Calendar,
  Bell,
  Check,
} from "lucide-react-native";
import Colors, { getStreakColor } from "@/constants/colors";
import { useAuth } from "@/providers/AuthProvider";
import { useStreak } from "@/providers/StreakProvider";
import { formatDate } from "@/utils/time";
import GlassDialog from "@/components/GlassDialog";

const GOAL_OPTIONS = [30, 60, 90, 365];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const {
    username,
    startDate,
    goalDays,
    currentStreak,
    reminderEnabled,
    setUsername,
    setGoalDays,
    setReminderEnabled,
  } = useStreak();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(username);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowLogoutDialog(true);
  }, []);

  const confirmLogout = useCallback(() => {
    setShowLogoutDialog(false);
    signOut();
  }, [signOut]);

  const handleSaveName = useCallback(() => {
    setUsername(nameInput.trim());
    setEditingName(false);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [nameInput, setUsername]);

  const handleGoalSelect = useCallback(
    (days: number) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setGoalDays(days);
    },
    [setGoalDays]
  );

  const handleToggleReminder = useCallback(
    (value: boolean) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setReminderEnabled(value);
    },
    [setReminderEnabled]
  );

  const progress = Math.min(1, currentStreak / goalDays);

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundEnd]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>プロフィール</Text>
        <View style={styles.headerLine} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <User color={Colors.textSecondary} size={28} strokeWidth={1.5} />
          </View>

          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="ユーザー名"
                placeholderTextColor={Colors.textDim}
                autoFocus
                maxLength={20}
                testID="profile-name-input"
              />
              <Pressable
                style={({ pressed }) => [styles.nameCheckBtn, pressed && { opacity: 0.6 }]}
                onPress={handleSaveName}
                testID="profile-name-save"
              >
                <Check color={Colors.text} size={16} strokeWidth={1.5} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => { setEditingName(true); setNameInput(username); }}>
              <Text style={styles.username}>
                {username || "ユーザー名を設定"}
              </Text>
            </Pressable>
          )}

          <Text style={styles.email}>{user?.email ?? ""}</Text>

          <View style={styles.infoRow}>
            <Calendar color={Colors.textDim} size={13} strokeWidth={1.5} />
            <Text style={styles.infoText}>
              開始日: {formatDate(startDate)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target color={Colors.textSecondary} size={15} strokeWidth={1.5} />
            <Text style={styles.sectionTitle}>目標設定</Text>
          </View>

          <View style={styles.goalRow}>
            {GOAL_OPTIONS.map((days) => (
              <Pressable
                key={days}
                style={({ pressed }) => [
                  styles.goalChip,
                  goalDays === days && styles.goalChipActive,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
                ]}
                onPress={() => handleGoalSelect(days)}
                testID={`goal-${days}`}
              >
                <Text
                  style={[
                    styles.goalChipText,
                    goalDays === days && styles.goalChipTextActive,
                  ]}
                >
                  {days}日
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: getStreakColor(currentStreak),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentStreak} / {goalDays}日 ({Math.round(progress * 100)}%)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Bell color={Colors.textSecondary} size={16} strokeWidth={1.5} />
              <Text style={styles.settingLabel}>デイリーリマインダー</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{
                false: "rgba(255,255,255,0.08)",
                true: "rgba(139, 0, 0, 0.35)",
              }}
              thumbColor={reminderEnabled ? Colors.accent : Colors.textMuted}
              testID="reminder-switch"
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
          ]}
          onPress={handleLogout}
          testID="logout-button"
        >
          <LogOut color={Colors.danger} size={16} strokeWidth={1.5} />
          <Text style={styles.logoutText}>ログアウト</Text>
        </Pressable>
      </ScrollView>

      <GlassDialog
        visible={showLogoutDialog}
        title="ログアウト"
        message="本当にログアウトしますか？"
        buttons={[
          { text: "キャンセル", style: "cancel", onPress: () => setShowLogoutDialog(false) },
          { text: "ログアウト", style: "destructive", onPress: confirmLogout },
        ]}
        onClose={() => setShowLogoutDialog(false)}
      />
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
  profileCard: {
    backgroundColor: Colors.glass,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    marginBottom: 16,
    ...(Platform.OS !== "web"
      ? { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }
      : {}),
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.glassStrong,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: Colors.glassBorderStrong,
  },
  username: {
    fontSize: 19,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  nameInput: {
    fontSize: 17,
    fontWeight: "500" as const,
    color: Colors.text,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.accent,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 120,
    textAlign: "center" as const,
  },
  nameCheckBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.glass,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  email: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 14,
    fontWeight: "300" as const,
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "300" as const,
    letterSpacing: 0.3,
  },
  section: {
    backgroundColor: Colors.glass,
    borderRadius: 20,
    padding: 22,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    marginBottom: 16,
    ...(Platform.OS !== "web"
      ? { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }
      : {}),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  goalRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
  },
  goalChip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: Colors.glass,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  goalChipActive: {
    backgroundColor: Colors.accentDim,
    borderColor: "rgba(139, 0, 0, 0.4)",
  },
  goalChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  goalChipTextActive: {
    color: Colors.accentLight,
  },
  progressContainer: {
    gap: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    fontWeight: "400" as const,
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "400" as const,
    letterSpacing: 0.3,
  },
  logoutButton: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginTop: 8,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    paddingVertical: 17,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.danger,
    letterSpacing: 0.5,
  },
});
