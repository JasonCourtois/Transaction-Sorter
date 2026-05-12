"use client";

import { useMemo, useState, useEffect } from "react";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { DailySpendChart } from "../../components/DailySpendChart";
import categoriesData from "./data/categories.json";
import styles from "./DashboardShell.module.css";
import { filterTransactions } from "./filterTransactions";
import { InboxSearchBar } from "./InboxSearchBar";
import type {
  InboxSearchFilters,
  SpendBreakdownItem,
  Transaction,
} from "./dashboard.types";
import { TransactionList } from "./TransactionList";
import { formatCurrency } from "./TransactionList";
import { UserAuth } from "@/context/AuthContext";

const categories = categoriesData as SpendBreakdownItem[];

const expenseCategoryNames = categories.map((c) => c.name) as readonly string[];

export function DashboardShell() {
  // Leaving this here to use with sync/refresh.
  const { user, accessToken } = UserAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [spendTotal, setSpendTotal] = useState(0);
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [parsedEmailCount, setParsedEmailCount] = useState(0);
  const [topCategory, setTopCategory] = useState("");

  const [inboxFilters, setInboxFilters] = useState<InboxSearchFilters>({
    category: "",
    keyword: "",
  });

  // Restore cached transactions from sessionStorage after hydration.
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("transactions");
      if (cached) setTransactions(JSON.parse(cached));
    } catch {}
    setHydrated(true);
  }, []);

  // Update statistics and persist transactions to sessionStorage.
  // Only write after hydration so we don't overwrite the cache with [].
  useEffect(() => {
    if (hydrated) {
      sessionStorage.setItem("transactions", JSON.stringify(transactions));
    }

    setSpendTotal(transactions.reduce((total, transaction) => total + transaction.amount, 0));

    setAverageConfidence(
      transactions.length > 0
        ? Math.round(
            transactions.reduce((total, transaction) => total + transaction.confidence, 0) /
            transactions.length,
          )
        : 0,
    );

    setParsedEmailCount(transactions.length);
  }, [transactions, hydrated]);

  const [daysBack, setDaysBack] = useState(30);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleSync = async () => {
    if (!user || !accessToken) return;
    setSyncing(true);
    try {
      const idToken = await user.getIdToken();
      await fetch("/api/gmail/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ accessToken, daysBack }),
      });
      // After sync, pull the fresh data
      handleRefresh();
    } finally {
      setSyncing(false);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/transactions?days=${daysBack}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Refresh failed:", res.status, text);
        return;
      }
      const data = await res.json();
      setTransactions(data.transactions ?? []);
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, inboxFilters),
    [transactions, inboxFilters],
  );

  return (
    <main className={styles.shell}>
      <section className={`${styles.contain} ${styles.kpis}`}>
        <article className={styles.kpiCard}>
          <span className={styles.metaLabel}>Detected spend</span>
          <strong>{formatCurrency(spendTotal)}</strong>
          <p>Across the most recent {transactions.length} receipt emails.</p>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.metaLabel}>Avg. parse confidence</span>
          <strong>{averageConfidence}%</strong>
          <p>Merchant, total, and summary extraction quality.</p>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.metaLabel}>Top category</span>
          <strong>{topCategory}</strong>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.metaLabel}>Parsed emails</span>
          <strong>{parsedEmailCount}</strong>
          <p>Receipts currently represented in this dashboard preview.</p>
        </article>
      </section>

      <section className={`${styles.contain} ${styles.analytics}`}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.metaLabel}>Charts</span>
              <h2>Daily spend</h2>
            </div>
          </div>
          <DailySpendChart transactions={transactions} />
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.metaLabel}>Categories</span>
              <h2>Spend by category</h2>
            </div>
          </div>
          <CategoryPieChart transactions={transactions} setTopCategory={setTopCategory} />
        </article>
      </section>

      <section className={`${styles.contain} ${styles.bottom}`}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.metaLabel}>Primary</span>
              <h2>Inbox</h2>
            </div>
            <div className={styles.inboxActions} aria-label="Inbox actions">
              <select
                className={styles.daysSelect}
                value={daysBack}
                onChange={(e) => setDaysBack(Number(e.target.value))}
                disabled={syncing || refreshing}
              >
                <option value={30}>Last 1 month</option>
                <option value={60}>Last 2 months</option>
                <option value={90}>Last 3 months</option>
                <option value={120}>Last 4 months</option>
                <option value={150}>Last 5 months</option>
                <option value={180}>Last 6 months</option>
              </select>
              <button
                type="button"
                className={styles.inboxActionButtonPrimary}
                onClick={handleSync}
                disabled={syncing || refreshing}
              >
                {syncing ? "Syncing…" : "Sync emails"}
              </button>
              <button
                type="button"
                className={styles.inboxActionButtonSecondary}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? "Refreshing…" : "Refresh items"}
              </button>
            </div>
          </div>

          <InboxSearchBar categoryNames={expenseCategoryNames} onSearch={setInboxFilters} />

          <TransactionList transactions={filteredTransactions} />
        </article>
      </section>
    </main>
  );
}
