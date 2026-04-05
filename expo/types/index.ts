export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalRelapses: number;
  startDate: string;
  relapses: RelapseEntry[];
  goalDays: number;
  username: string;
  reminderEnabled: boolean;
}

export interface RelapseEntry {
  id: string;
  date: string;
  streakBefore: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
}

export interface DayStatus {
  date: string;
  clean: boolean;
}
