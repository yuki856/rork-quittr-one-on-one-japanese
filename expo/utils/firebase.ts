import { initializeApp } from "firebase/app";
// @ts-ignore
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyDeJAvDGLRbpXrkmDrOn6scWD7KVTUM9Pg",
  authDomain: "nofa-ai.firebaseapp.com",
  projectId: "nofa-ai",
  storageBucket: "nofa-ai.firebasestorage.app",
  messagingSenderId: "167631217848",
  appId: "1:167631217848:web:fc426cbed38d5ecb25004d",
};

const app = initializeApp(firebaseConfig);

let auth: ReturnType<typeof getAuth>;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { app, auth };

const CLOUD_FUNCTION_BASE =
  "https://asia-northeast1-nofa-ai.cloudfunctions.net";

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function callChatFunction(params: {
  message: string;
  conversationId: string | null;
  scenario: string;
}): Promise<{ reply: string; conversationId: string }> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("ログインが必要です");
  }

  const token = await user.getIdToken(true);

  console.log("[Firebase] Calling chat function with:", {
    message: params.message,
    conversationId: params.conversationId,
    scenario: params.scenario,
  });

  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[Firebase] Retry attempt ${attempt}/${maxRetries}`);
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }

      const response = await fetchWithTimeout(
        `${CLOUD_FUNCTION_BASE}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: params.message,
            conversationId: params.conversationId,
            scenario: params.scenario,
          }),
        },
        30000
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "[Firebase] Chat function error:",
          response.status,
          errorText
        );
        throw new Error(`チャットエラー: ${response.status}`);
      }

      const data = await response.json();
      console.log("[Firebase] Chat function response:", data);
      return data as { reply: string; conversationId: string };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      lastError = err;
      console.error(`[Firebase] Attempt ${attempt} failed:`, err.message);

      if (err.name === "AbortError") {
        lastError = new Error("接続がタイムアウトしました。もう一度お試しください。");
        continue;
      }

      if (
        err.message.includes("Failed to fetch") ||
        err.message.includes("Network request failed") ||
        err.message.includes("network")
      ) {
        lastError = new Error(
          "サーバーに接続できません。ネットワーク接続を確認してください。"
        );
        if (attempt < maxRetries) continue;
      }

      if (
        !err.message.includes("Failed to fetch") &&
        !err.message.includes("Network request failed") &&
        err.name !== "AbortError"
      ) {
        throw err;
      }
    }
  }

  throw lastError ?? new Error("不明なエラーが発生しました。");
}
