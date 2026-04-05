const Colors = {
  background: "#0A0A0A",
  backgroundEnd: "#111111",
  surface: "#141414",
  card: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.06)",
  borderLight: "rgba(255,255,255,0.12)",

  glass: "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.1)",
  glassStrong: "rgba(255,255,255,0.08)",
  glassBorderStrong: "rgba(255,255,255,0.14)",

  text: "#F0F0F0",
  textSecondary: "#8A8A8E",
  textMuted: "#555558",
  textDim: "#3A3A3C",

  white: "#FFFFFF",
  black: "#000000",

  accent: "#8B0000",
  accentLight: "#CC2222",
  accentDim: "rgba(139, 0, 0, 0.15)",

  danger: "#E53935",
  dangerDim: "rgba(229, 57, 53, 0.08)",
  dangerBorder: "rgba(229, 57, 53, 0.2)",
  dangerGlow: "rgba(229, 57, 53, 0.15)",

  success: "#1E7A3A",
  successDim: "rgba(30, 122, 58, 0.15)",

  blue: "#4A90D9",
  blueDim: "rgba(74, 144, 217, 0.08)",
  blueBorder: "rgba(74, 144, 217, 0.2)",
  blueGlow: "rgba(74, 144, 217, 0.15)",

  streakDay0: "#8B0000",
  streakDay8: "#CC4400",
  streakDay15: "#CC8800",
  streakDay30: "#008080",
  streakDay60: "#2E5CB8",
  streakDay90: "#1E3A7B",

  cleanDay: "#8B0000",
  relapseDay: "#444444",

  chatBubbleUser: "rgba(74, 144, 217, 0.1)",
  chatBubbleUserBorder: "rgba(74, 144, 217, 0.15)",
  chatBubbleAI: "rgba(255,255,255,0.04)",
  chatBubbleAIBorder: "rgba(255,255,255,0.08)",

  tabBar: "#1C1C1E",
  tabBarBorder: "rgba(255,255,255,0.06)",
  tabActive: "#FFFFFF",
  tabActiveHighlight: "rgba(255,255,255,0.1)",
  tabInactive: "#666666",

  light: {
    text: "#F0F0F0",
    background: "#0A0A0A",
    tint: "#E53935",
    tabIconDefault: "#555558",
    tabIconSelected: "#E53935",
  },
};

export function getStreakColor(days: number): string {
  if (days >= 90) return Colors.streakDay90;
  if (days >= 60) return Colors.streakDay60;
  if (days >= 30) return Colors.streakDay30;
  if (days >= 15) return Colors.streakDay15;
  if (days >= 8) return Colors.streakDay8;
  return Colors.streakDay0;
}

export function getStreakGlow(days: number): string {
  const color = getStreakColor(days);
  return color + "40";
}

export default Colors;
