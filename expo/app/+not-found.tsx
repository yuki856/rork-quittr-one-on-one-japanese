import { Stack, useRouter } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Colors from "@/constants/colors";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Not Found", headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.text}>ページが見つかりません</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.replace("/")}
          testID="not-found-home"
        >
          <Text style={styles.buttonText}>ホームへ戻る</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  code: {
    fontSize: 64,
    fontWeight: "800" as const,
    color: Colors.accent,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.card,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
});
