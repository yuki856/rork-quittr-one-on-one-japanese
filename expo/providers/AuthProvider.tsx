import { useEffect, useState, useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth } from "@/utils/firebase";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[Auth] State changed:", firebaseUser?.email ?? "signed out");
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      console.log("[Auth] Signing in:", email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      console.log("[Auth] Signing up:", email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      console.log("[Auth] Signing out");
      await firebaseSignOut(auth);
    },
  });

  const signIn = useCallback(
    (email: string, password: string) => signInMutation.mutateAsync({ email, password }),
    [signInMutation]
  );

  const signUp = useCallback(
    (email: string, password: string) => signUpMutation.mutateAsync({ email, password }),
    [signUpMutation]
  );

  const signOut = useCallback(
    () => signOutMutation.mutate(),
    [signOutMutation]
  );

  const isAuthenticated = user !== null;

  return useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      signIn,
      signUp,
      signOut,
      signInPending: signInMutation.isPending,
      signUpPending: signUpMutation.isPending,
      signInError: signInMutation.error,
      signUpError: signUpMutation.error,
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      signIn,
      signUp,
      signOut,
      signInMutation.isPending,
      signUpMutation.isPending,
      signInMutation.error,
      signUpMutation.error,
    ]
  );
});
