"use client";

import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { UserAuth } from "@/context/AuthContext";

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

            <div className={styles.previewList}>
              <div className={styles.previewItem}>
                <span className={styles.merchantDot} />
                <div>
                  <strong>Google Workspace</strong>
                  <p>Subscriptions • $18.00</p>
                </div>
                <span className={styles.categoryTag}>Software</span>
              </div>

              <div className={styles.previewItem}>
                <span className={styles.merchantDotAlt} />
                <div>
                  <strong>Uber</strong>
                  <p>Ride receipt • $24.16</p>
                </div>
                <span className={styles.categoryTag}>Travel</span>
              </div>

              <div className={styles.previewItem}>
                <span className={styles.merchantDotWarm} />
                <div>
                  <strong>Whole Foods</strong>
                  <p>Purchase confirmation • $64.83</p>
                </div>
                <span className={styles.categoryTag}>Groceries</span>
              </div>
            </div>

            <div className={styles.previewFooter}>
              <span className={styles.previewFooterLabel}>Categories surfaced</span>
              <div className={styles.categoryPills}>
                <span>Software</span>
                <span>Travel</span>
                <span>Groceries</span>
              </div>
            </div>
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
        <p>Transaction Sorter - development preview</p>
      </div>
    </main>
  );
}
