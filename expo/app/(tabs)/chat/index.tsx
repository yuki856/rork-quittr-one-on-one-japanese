import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Send, Shield } from "lucide-react-native";
import Colors from "@/constants/colors";
import { ChatMessage } from "@/types";
import { callChatFunction } from "@/utils/firebase";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await callChatFunction({
        message,
        conversationId,
        scenario: "nofap_coach",
      });
      return response;
    },
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + "_ai",
        text: data.reply,
        sender: "ai",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
    onError: (error) => {
      console.error("[Chat] Error:", error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + "_error",
        text: "エラーが発生しました。もう一度お試しください。",
        sender: "ai",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || chatMutation.isPending) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    chatMutation.mutate(text);
  }, [inputText, chatMutation]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {!isUser && <Text style={styles.senderLabel}>ノファ AI</Text>}
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  if (!isAuthenticated) {
    return (
      <LinearGradient
        colors={[Colors.background, Colors.backgroundEnd]}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.authPromptContainer}>
          <View style={styles.authIconCircle}>
            <Shield color={Colors.accent} size={32} />
          </View>
          <Text style={styles.authTitle}>ログインが必要です</Text>
          <Text style={styles.authDescription}>
            AIコーチと会話するには{"\n"}ログインしてください
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.authButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.push("/auth")}
            testID="chat-login-button"
          >
            <Text style={styles.authButtonText}>ログイン</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundEnd]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ノファ AI コーチ</Text>
        <View style={styles.headerLine} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>ノファ AI</Text>
              <Text style={styles.emptyText}>
                衝動と闘う時、ここに来い。{"\n"}
                お前の状況を話せ。
              </Text>
            </View>
          }
        />

        {chatMutation.isPending && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDots}>
              <ActivityIndicator size="small" color={Colors.textMuted} />
            </View>
            <Text style={styles.typingText}>考え中...</Text>
          </View>
        )}

        <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) + 66 + 16 }]}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="今の状況を教えろ..."
              placeholderTextColor={Colors.textDim}
              multiline
              maxLength={1000}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              testID="chat-input"
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                (!inputText.trim() || chatMutation.isPending) && styles.sendButtonDisabled,
                pressed && { opacity: 0.7, transform: [{ scale: 0.94 }] },
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || chatMutation.isPending}
              testID="chat-send"
            >
              <Send color={inputText.trim() ? "#FFFFFF" : Colors.textDim} size={16} strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
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
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: Colors.chatBubbleUser,
    borderWidth: 0.5,
    borderColor: Colors.chatBubbleUserBorder,
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.chatBubbleAI,
    borderWidth: 0.5,
    borderColor: Colors.chatBubbleAIBorder,
    borderBottomLeftRadius: 6,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: "500" as const,
    color: Colors.textDim,
    marginBottom: 4,
    textTransform: "uppercase" as const,
    letterSpacing: 1.5,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#C8D6E5",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.textSecondary,
    marginBottom: 12,
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center" as const,
    lineHeight: 22,
    fontWeight: "300" as const,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingDots: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  typingText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "300" as const,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(10,10,10,0.95)",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(139,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(139,0,0,0.3)",
    marginBottom: 2,
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  authPromptContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  authIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accentDim,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(139,0,0,0.25)",
  },
  authTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  authDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: "300" as const,
  },
  authButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
