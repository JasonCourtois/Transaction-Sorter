import type { Metadata } from "next";
import { DashboardShell } from "./DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard | Transaction Sorter",
  description:
    "A transaction intelligence dashboard showing parsed receipt activity, category trends, and recent purchases.",
};

export default function DashboardPage() {
  return <DashboardShell />;
}
