import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import Colors from "@/constants/colors";

interface DialogButton {
  text: string;
  onPress: () => void;
  style?: "cancel" | "destructive" | "default";
}

interface GlassDialogProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: DialogButton[];
  onClose: () => void;
}

function DialogBackdrop({ children }: { children: React.ReactNode }) {
  if (Platform.OS === "web") {
    return (
      <View style={[StyleSheet.absoluteFill, styles.backdropWeb]}>
        {children}
      </View>
    );
  }
  return (
    <BlurView intensity={30} tint="dark" style={[StyleSheet.absoluteFill, styles.backdrop]}>
      {children}
    </BlurView>
  );
}

export default function GlassDialog({
  visible,
  title,
  message,
  buttons,
  onClose,
}: GlassDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <DialogBackdrop>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.buttonRow}>
              {buttons.map((btn, index) => {
                const isDestructive = btn.style === "destructive";
                const isCancel = btn.style === "cancel";
                return (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [
                      styles.button,
                      isDestructive && styles.destructiveButton,
                      isCancel && styles.cancelButton,
                      pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
                    ]}
                    onPress={btn.onPress}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        isDestructive && styles.destructiveText,
                        isCancel && styles.cancelText,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </DialogBackdrop>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdropWeb: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "rgba(20,20,20,0.95)",
    borderRadius: 20,
    padding: 28,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    ...Platform.select({
      web: {},
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    textAlign: "center" as const,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 15,
    fontWeight: "400" as const,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
    marginBottom: 28,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  destructiveButton: {
    backgroundColor: "rgba(139,0,0,0.6)",
    borderWidth: 0.5,
    borderColor: "rgba(139,0,0,0.4)",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
  },
  cancelText: {
    color: Colors.text,
  },
  destructiveText: {
    color: "#FFFFFF",
  },
});
