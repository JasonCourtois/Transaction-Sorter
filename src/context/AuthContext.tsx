"use client";

import { createContext, useState, useContext, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  accessToken: string | null; // Google OAuth token — used to call Gmail API
  loading: boolean;
  signIn: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Persist the Firebase session across page refreshes.
  // Note: accessToken is NOT persisted — if the user refreshes,
  // they'll need to sign in again to get a fresh Google OAuth token for Gmail.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      // Set or clear the session cookie — middleware reads this to protect /dashboard
      if (firebaseUser) {
        document.cookie = "session=true; path=/; SameSite=Strict";
      } else {
        document.cookie = "session=; path=/; max-age=0";
      }
    });
    return () => unsubscribe(); // cleanup listener on unmount
  }, []);

  const signIn = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();

      // Request Gmail read access on top of the default profile + email scopes
      provider.addScope("https://www.googleapis.com/auth/gmail.readonly");

      const result = await signInWithPopup(auth, provider);

      // Firebase gives two different tokens:
      // 1. Firebase ID token  → proves who the user is to YOUR server (use user.getIdToken())
      // 2. Google access token → proves permission to call GOOGLE APIs like Gmail
      // We need #2 to call the Gmail API in our sync route.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken ?? null;

      setUser(result.user);
      setAccessToken(token);

      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setAccessToken(null);
    document.cookie = "session=; path=/; max-age=0"; // clear cookie on sign out
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UserAuth must be used within AuthContextProvider");
  }
  return context;
};
