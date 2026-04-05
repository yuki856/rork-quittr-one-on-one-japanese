const Colors = {
  background: "#050508",
  backgroundEnd: "#0A0A10",
  text: "#EAEAEA",
  textSecondary: "#8A8A8E",
  textMuted: "#555558",
  textDim: "#3A3A3D",
  white: "#FFFFFF",
  accent: "#8B0000",
  accentLight: "#D4A0A0",
  accentDim: "rgba(139,0,0,0.15)",
  danger: "#C0392B",
  dangerDim: "rgba(192,57,43,0.12)",
  dangerBorder: "rgba(192,57,43,0.3)",
  blue: "#4A90D9",
  glass: "rgba(255,255,255,0.04)",
  glassStrong: "rgba(255,255,255,0.08)",
  glassBorder: "rgba(255,255,255,0.08)",
  glassBorderStrong: "rgba(255,255,255,0.12)",
  card: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.08)",
  chatBubbleUser: "rgba(139,0,0,0.15)",
  chatBubbleUserBorder: "rgba(139,0,0,0.25)",
  chatBubbleAI: "rgba(255,255,255,0.04)",
  chatBubbleAIBorder: "rgba(255,255,255,0.08)",
  cleanDay: "#C0392B",
  relapseDay: "#555558",
  tabBar: "#1C1C1E",
  light: {
    text: "#000",
    background: "#fff",
    tint: "#8B0000",
    tabIconDefault: "#666666",
    tabIconSelected: "#FFFFFF",
  },
};

export function getStreakColor(days: number): string {
  if (days >= 90) return "#FFD700";
  if (days >= 30) return "#C0392B";
  if (days >= 7) return "#E74C3C";
  return "#8B0000";
}

export function getStreakGlow(days: number): string {
  if (days >= 90) return "rgba(255,215,0,0.15)";
  if (days >= 30) return "rgba(192,57,43,0.15)";
  if (days >= 7) return "rgba(231,76,60,0.15)";
  return "rgba(139,0,0,0.15)";
}

export default Colors;
