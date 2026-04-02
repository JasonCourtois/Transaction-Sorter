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
        <div>logo TBD</div>
        <div>
          <button className={styles.navButton} onClick={login}>
            Login
          </button>
        </div>
      </div>
      <section className={styles.hero}>
        <h1>Financial Life Simplified</h1>
        <p>
          Automatically sort and categorize transactions from your email
          receipts
        </p>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.featureCard}>
          <h3>Scan & Sort</h3>
          <p>
            Forward your email receipts and we'll automatically extract
            transaction details, categorize spending, and organize everything in
            one place.
          </p>
        </div>

        <div className={styles.featureCard}>
          <h3>Track Spending Habits</h3>
          <p>
            Get detailed breakdowns of your spending by category. See where your
            money goes and identify patterns to help you budget better.
          </p>
        </div>

        <div className={styles.featureCard}>
          <h3>Fast & Simple</h3>
          <p>
            No manual data entry. No complex setup. Just forward receipts and
            watch your spending history build automatically.
          </p>
        </div>
      </section>

      <div className={styles.cta}>
        <p>Start organizing your finances today</p>
      </div>
    </main>
  );
}
