"use client"

import { createContext, useState, useContext } from "react";

type Session = {
  email: string;
} | null | undefined;

// This type defines all of the data that is stored in the Auth Context Provider.
type AuthContextType = {
  session: Session;
  signUpNewUser: (
  ) => Promise<{ success: boolean; data: Session }>;
  signIn: (
  ) => Promise<{ success: boolean; data: Session }>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// TODO: This is a dummy file that I made just to simulate a user auth. With google auth through firebase this file will look much different.
export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session>(undefined);

  // Sign Up Function
  const signUpNewUser = async () => {
    if (session) {
      await signOut(); // If user is already logged into another account, sign them out first.
    }
    const sessionData = {
      email: "guest@gmail.com",
    };

    setSession(sessionData);

    return { success: true, data: sessionData };
  };

  // Sign Out Function
  const signOut = async () => {
    setSession(null);
  };

  // Sign In Function
  const signIn = async () => {
    const sessionData = {
      email: "guest@gmail.com",
    };

    setSession(sessionData);

    return { success: true, data: sessionData };
  };

  return (
    <AuthContext.Provider value={{ session, signUpNewUser, signOut, signIn }}>
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
