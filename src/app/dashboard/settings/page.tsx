import type { Metadata } from "next";
import styles from "./settings.module.css";

export const metadata: Metadata = {
  title: "User settings | Transaction Sorter",
  description: "Account and application preferences.",
};

export default function UserSettingsPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>User settings</h1>
      <p className={styles.lead}>
        Preferences and account options will go here.
      </p>
    </main>
  );
}
