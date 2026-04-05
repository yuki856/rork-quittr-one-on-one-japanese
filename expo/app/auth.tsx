import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/providers/AuthProvider";

function getFirebaseErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/invalid-email":
      return "メールアドレスの形式が正しくありません";
    case "auth/user-disabled":
      return "このアカウントは無効化されています";
    case "auth/user-not-found":
      return "アカウントが見つかりません";
    case "auth/wrong-password":
      return "パスワードが正しくありません";
    case "auth/invalid-credential":
      return "メールアドレスまたはパスワードが正しくありません";
    case "auth/email-already-in-use":
      return "このメールアドレスは既に使用されています";
    case "auth/weak-password":
      return "パスワードは6文字以上にしてください";
    case "auth/too-many-requests":
      return "試行回数が多すぎます。しばらくしてからお試しください";
    default:
      return "エラーが発生しました。もう一度お試しください";
  }
}

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signIn, signUp, signInPending, signUpPending } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isPending = signInPending || signUpPending;

  const toggleMode = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => {
      setIsLogin((prev) => !prev);
      setError(null);
      setConfirmPassword("");
    }, 120);
  }, [fadeAnim]);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.log("[Auth] Error:", e);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(getFirebaseErrorMessage(e));
    }
  }, [email, password, confirmPassword, isLogin, signIn, signUp]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Shield color={Colors.accent} size={36} />
            </View>
            <Text style={styles.appName}>NoFa</Text>
            <Text style={styles.appTagline}>お前の規律を鍛えろ</Text>
          </View>

          <Animated.View style={[styles.formSection, { opacity: fadeAnim }]}>
            <Text style={styles.formTitle}>
              {isLogin ? "ログイン" : "アカウント作成"}
            </Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <Mail
                  color={Colors.textMuted}
                  size={18}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="メールアドレス"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="auth-email"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock
                  color={Colors.textMuted}
                  size={18}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="パスワード"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  testID="auth-password"
                />
                <Pressable
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={8}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff color={Colors.textMuted} size={18} />
                  ) : (
                    <Eye color={Colors.textMuted} size={18} />
                  )}
                </Pressable>
              </View>

              {!isLogin && (
                <View style={styles.inputWrapper}>
                  <Lock
                    color={Colors.textMuted}
                    size={18}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="パスワード（確認）"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showPassword}
                    testID="auth-confirm-password"
                  />
                </View>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && { opacity: 0.85 },
                isPending && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={isPending}
              testID="auth-submit"
            >
              {isPending ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isLogin ? "ログイン" : "登録"}
                </Text>
              )}
            </Pressable>

            <Pressable onPress={toggleMode} style={styles.switchBtn}>
              <Text style={styles.switchText}>
                {isLogin
                  ? "アカウントをお持ちでない方は"
                  : "既にアカウントをお持ちの方は"}
              </Text>
              <Text style={styles.switchAction}>
                {isLogin ? "新規登録" : "ログイン"}
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentDim,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(139, 0, 0, 0.3)",
  },
  appName: {
    fontSize: 32,
    fontWeight: "900" as const,
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: 4,
  },
  appTagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  formSection: {
    width: "100%",
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 20,
    textAlign: "center" as const,
  },
  errorBox: {
    backgroundColor: Colors.dangerDim,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dangerBorder,
  },
  errorText: {
    fontSize: 13,
    color: Colors.danger,
    textAlign: "center" as const,
    lineHeight: 18,
  },
  inputGroup: {
    gap: 12,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  inputIcon: {
    marginLeft: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 12,
    fontSize: 15,
    color: Colors.text,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.white,
  },
  switchBtn: {
    alignItems: "center",
    marginTop: 20,
    gap: 2,
  },
  switchText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  switchAction: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.accentLight,
  },
});
