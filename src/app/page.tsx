"use client";

import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { UserAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { signIn } = UserAuth();
  const login = async () => {
    const { success, data } = await signIn();

    if (success) {
      router.push("/dashboard");
    } else {
      console.error(`Signin error: ${data}`);
    }
  };
  return (
    <main className={styles.mainContainer}>
      <div className={styles.navbar}>
        <div className={styles.brand}>
          <strong>Transaction</strong> Sorter
        </div>
        <div>
          <button type="button" className={styles.navButton} onClick={login}>
            Sign in
          </button>
        </div>
      </div>
      <section className={styles.hero}>
        <h1>Receipts from Gmail, organized</h1>
        <p>
          Forward or connect mail; we pull amounts, merchants, and categories
          into a single list you can scan like your inbox.
        </p>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.featureCard}>
          <h3>Parsing</h3>
          <p>
            Reads receipt mail for totals, dates, and merchants so you do not
            re-type lines from PDFs or confirmations.
          </p>
        </div>

        <div className={styles.featureCard}>
          <h3>Categories</h3>
          <p>
            Buckets each line into categories you can filter and export when you
            reconcile the month.
          </p>
        </div>

        <div className={styles.featureCard}>
          <h3>Setup</h3>
          <p>
            Sign in with Google, pick a label or forwarding rule, and new mail
            shows up in the dashboard as it arrives.
          </p>
        </div>
      </section>

      <div className={styles.cta}>
        <p>Transaction Sorter — development preview</p>
      </div>
    </main>
  );
}
