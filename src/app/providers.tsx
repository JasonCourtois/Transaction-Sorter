"use client";

import { AuthContextProvider } from "@/context/AuthContext";
import { TransactionContextProvider } from "@/context/TransactionsContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      <TransactionContextProvider>{children}</TransactionContextProvider>
    </AuthContextProvider>
  );
}
