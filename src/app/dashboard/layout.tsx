"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { UserAuth } from "@/context/AuthContext";
import { AppNavbar } from "@/components/AppNavbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = UserAuth();

  useEffect(() => {
    if (!loading && user === null) {
      redirect("/");
    }
  }, [user, loading]);

  // Show nothing while loading to prevent flash of unauthenticated content
  if (loading) {
    return null;
  }

  if (user !== null) {
    return (
      <>
        <AppNavbar />
        {children}
      </>
    );
  }
}
