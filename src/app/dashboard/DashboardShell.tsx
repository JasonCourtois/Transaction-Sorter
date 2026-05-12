"use client";

import { useMemo, useState, useEffect } from "react";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { DailySpendChart } from "../../components/DailySpendChart";
import categoriesData from "./data/categories.json";
import transactionsData from "./data/transactions.json";
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

const timePeriodOptions = ["1 Month", "2 Months", "6 Months"]

export function DashboardShell() {
  // Leaving this here to use with sync/refresh.
  const { user } = UserAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spendTotal, setSpendTotal] = useState(0);
  const [averageConfidence, setAverageConfidence] = useState(0);
  const [parsedEmailCount, setParsedEmailCount] = useState(0);
  const [topCategory, setTopCategory] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(timePeriodOptions[0]);

  const [inboxFilters, setInboxFilters] = useState<InboxSearchFilters>({
    category: "",
    keyword: "",
  });

  // Load dummy data on site load
  useEffect(() => {
    setTransactions(transactionsData as Transaction[]);
  }, []);

  // Update statistics on site when transactions are updated.
  useEffect(() => {
    setSpendTotal(transactions.reduce((total, transaction) => total + transaction.amount, 0));

    setAverageConfidence(
      Math.round(
        transactions.reduce((total, transaction) => total + transaction.confidence, 0) /
          transactions.length,
      ),
    );

    setParsedEmailCount(transactions.length);
  }, [transactions]);

  const handleSync = () => {
    // use setTransactions to update transactions here
  };

  const handleRefresh = () => {
    // use setTransactions to update transactions here
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
          <p>In the last {selectedPeriod}.</p>
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
              <select onChange={(e) => {console.log("t");setSelectedPeriod(e.target.value);}}>
                {timePeriodOptions.map((item, index) => (
                  <option key={index} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
          <DailySpendChart transactions={transactions}/>
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
              <button
                type="button"
                className={styles.inboxActionButtonPrimary}
                onClick={handleSync}
              >
                Sync emails
              </button>
              <button
                type="button"
                className={styles.inboxActionButtonSecondary}
                onClick={handleRefresh}
              >
                Refresh items
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
