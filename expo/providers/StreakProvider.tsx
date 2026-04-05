import { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { StreakData, RelapseEntry } from "@/types";

const STREAK_KEY = "nofa_streak_data";

const DEFAULT_DATA: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  totalRelapses: 0,
  startDate: new Date().toISOString(),
  relapses: [],
  goalDays: 90,
  username: "",
  reminderEnabled: false,
};

function calculateStreak(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export const [StreakProvider, useStreak] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [data, setData] = useState<StreakData>(DEFAULT_DATA);

  const dataQuery = useQuery({
    queryKey: ["streak_data"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STREAK_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StreakData;
        console.log("[Streak] Loaded data:", parsed);
        return parsed;
      }
      console.log("[Streak] No stored data, using defaults");
      return DEFAULT_DATA;
    },
  });

  useEffect(() => {
    if (dataQuery.data) {
      setData(dataQuery.data);
    }
  }, [dataQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (newData: StreakData) => {
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newData));
      console.log("[Streak] Saved data");
      return newData;
    },
    onSuccess: (saved) => {
      setData(saved);
      void queryClient.invalidateQueries({ queryKey: ["streak_data"] });
    },
  });

  const currentStreak = useMemo(() => calculateStreak(data.startDate), [data.startDate]);

  const relapse = useCallback(() => {
    const entry: RelapseEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      streakBefore: currentStreak,
    };
    const newData: StreakData = {
      ...data,
      currentStreak: 0,
      longestStreak: Math.max(data.longestStreak, currentStreak),
      totalRelapses: data.totalRelapses + 1,
      startDate: new Date().toISOString(),
      relapses: [entry, ...data.relapses],
    };
    saveMutation.mutate(newData);
  }, [data, currentStreak, saveMutation]);

  const setGoalDays = useCallback(
    (days: number) => {
      const newData = { ...data, goalDays: days };
      saveMutation.mutate(newData);
    },
    [data, saveMutation]
  );

  const setUsername = useCallback(
    (name: string) => {
      const newData = { ...data, username: name };
      saveMutation.mutate(newData);
    },
    [data, saveMutation]
  );

  const setReminderEnabled = useCallback(
    (enabled: boolean) => {
      const newData = { ...data, reminderEnabled: enabled };
      saveMutation.mutate(newData);
    },
    [data, saveMutation]
  );

  const resetAll = useCallback(async () => {
    await AsyncStorage.removeItem(STREAK_KEY);
    setData(DEFAULT_DATA);
    void queryClient.invalidateQueries({ queryKey: ["streak_data"] });
  }, [queryClient]);

  const longestStreak = Math.max(data.longestStreak, currentStreak);

  return useMemo(
    () => ({
      currentStreak,
      longestStreak,
      totalRelapses: data.totalRelapses,
      startDate: data.startDate,
      relapses: data.relapses,
      goalDays: data.goalDays,
      username: data.username,
      reminderEnabled: data.reminderEnabled,
      isLoading: dataQuery.isLoading,
      relapse,
      setGoalDays,
      setUsername,
      setReminderEnabled,
      resetAll,
    }),
    [
      currentStreak,
      longestStreak,
      data.totalRelapses,
      data.startDate,
      data.relapses,
      data.goalDays,
      data.username,
      data.reminderEnabled,
      dataQuery.isLoading,
      relapse,
      setGoalDays,
      setUsername,
      setReminderEnabled,
      resetAll,
    ]
  );
});
