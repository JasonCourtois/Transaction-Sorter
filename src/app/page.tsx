"use client";

import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { UserAuth } from "@/context/AuthContext";
import { TransactionList } from "./dashboard/TransactionList";

const demoTransactions = [
  {
    merchant: "Google Workspace",
    category: "Software",
    amount: 18,
    summary: "Subscription receipt from Google Workspace.",
    source: "Gmail",
    date: "2026-05-10",
    confidence: 96,
  },
  {
    merchant: "Uber",
    category: "Travel",
    amount: 24.16,
    summary: "Ride receipt captured from an email confirmation.",
    source: "Gmail",
    date: "2026-05-09",
    confidence: 92,
  },
  {
    merchant: "Whole Foods",
    category: "Groceries",
    amount: 64.83,
    summary: "Purchase confirmation sorted into groceries.",
    source: "Gmail",
    date: "2026-05-08",
    confidence: 89,
  },
];

export default function Home() {
  const router = useRouter();
  const { signIn } = UserAuth();
  const login = async () => {
    const { success, error } = await signIn();

    if (success) {
      router.push("/dashboard");
    } else {
      console.error(`Signin error: ${error}`);
    }
  };

  return (
    <main className={styles.mainContainer}>
      <div className={styles.backgroundOrbOne} />
      <div className={styles.backgroundOrbTwo} />
      <div className={styles.backgroundGrid} />

      <header className={styles.navbar}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            TS
          </span>
          <span>
            <strong>Transaction</strong> Sort
          </span>
        </div>

        <div className={styles.navActions}>
          <button type="button" className={styles.navButton} onClick={login}>
            Sign in
          </button>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Built for Gmail</p>
          <h1>Transaction Sort</h1>
          <p className={styles.heroText}>
            Transaction Sorter reads receipt and purchase emails, groups them
            into categories, and surfaces the key details in a clean dashboard.
          </p>

          <div className={styles.ctaRow}>
            <button type="button" className={styles.navButton} onClick={login}>
              Sign in
            </button>
          </div>
        </div>

        <div className={styles.previewPanel}>
          <div className={styles.previewTop}>
            <span className={styles.previewBadge}>Dashboard preview</span>
            <span className={styles.previewMeta}>Parsed from email</span>
          </div>

          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <div>
                <p className={styles.previewTitle}>Recent transactions</p>
                <p className={styles.previewSubtitle}>
                  Clean summaries from incoming receipt mail
                </p>
              </div>
            </div>

            <TransactionList transactions={demoTransactions} />
          </div>
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.featureCard}>
          <h3>Category-first dashboard</h3>
          <p>
            Review transaction emails in grouped views so the important details
            are easier to scan than a crowded inbox.
          </p>
        </div>

        <div className={styles.featureCard}>
          <h3>AI-assisted parsing</h3>
          <p>
            Extracts useful transaction details from email content before they
            land in the dashboard.
          </p>
        </div>

        <div className={styles.featureCard}>
          <h3>Firebase-backed app flow</h3>
          <p>
            Google sign-in and the app data layer keep the experience tied to
            the same account you use in Gmail.
          </p>
        </div>
      </section>

      <div className={styles.cta}>
        <p>Transaction Sorter - UMB CS 436</p>
      </div>
    </main>
  );
}
