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

export async function callChatFunction(params: {
  message: string;
  conversationId: string | null;
  scenario: string;
}): Promise<{ reply: string; conversationId: string }> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("ログインが必要です");
  }

  const token = await user.getIdToken();

  console.log("[Firebase] Calling chat function with:", {
    message: params.message,
    conversationId: params.conversationId,
    scenario: params.scenario,
  });

  const response = await fetch(`${CLOUD_FUNCTION_BASE}/chat`, {
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
  });

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
}
