"use client";

import { useMemo, useState } from "react";
import { CategoryMixChart } from "../../components/CategoryMixChart";
import { DailySpendChart } from "../../components/DailySpendChart";
import categoriesData from "./data/categories.json";
import inboxSignalsData from "./data/inbox-signals.json";
import merchantWatchlistData from "./data/merchant-watchlist.json";
import spendTrendData from "./data/spend-trend.json";
import transactionsData from "./data/transactions.json";
import styles from "./DashboardShell.module.css";
import { filterTransactions } from "./filterTransactions";
import { InboxSearchBar } from "./InboxSearchBar";
import { ParsedEmailRow } from "./ParsedEmailRow";
import type {
  InboxSearchFilters,
  InboxSignal,
  MerchantWatchlistItem,
  SpendCategory,
  SpendTrendData,
  Transaction,
} from "./dashboard.types";

const transactions = transactionsData as Transaction[];
const categories = categoriesData as SpendCategory[];
const inboxSignals = inboxSignalsData as InboxSignal[];
const merchantWatchlist = merchantWatchlistData as MerchantWatchlistItem[];
const spendTrend = spendTrendData as SpendTrendData;

const spendTotal = transactions.reduce((total, transaction) => total + transaction.amount, 0);

const averageConfidence = Math.round(
  transactions.reduce((total, transaction) => total + transaction.confidence, 0) /
    transactions.length,
);

const topCategory = categories.reduce((highest, category) =>
  category.value > highest.value ? category : highest,
);

const categoryTotal = categories.reduce((total, category) => total + category.value, 0);

const topCategoryShare = Math.round((topCategory.value / categoryTotal) * 100);
const parsedEmailCount = transactions.length;

const expenseCategoryNames = categories.map((c) => c.name) as readonly string[];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function DashboardShell() {
  const [inboxFilters, setInboxFilters] = useState<InboxSearchFilters>({
    category: "",
    keyword: "",
  });

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, inboxFilters),
    [inboxFilters],
  );

  const inboxBadge =
    !inboxFilters.category && !inboxFilters.keyword
      ? "Sample"
      : `${filteredTransactions.length} match${filteredTransactions.length === 1 ? "" : "es"}`;

  return (
    <main className={styles.shell}>
      <section className={`${styles.contain} ${styles.kpis}`}>
        <article className={styles.kpiCard}>
          <span className={styles.metaLabel}>Detected spend</span>
          <strong>{formatCurrency(spendTotal)}</strong>
          <p>Across the most recent 6 receipt emails.</p>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.metaLabel}>Avg. parse confidence</span>
          <strong>{averageConfidence}%</strong>
          <p>Merchant, total, and summary extraction quality.</p>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.metaLabel}>Top category</span>
          <strong>{topCategory.name}</strong>
          <p>{topCategoryShare}% of this month&apos;s total mock spend.</p>
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
            <span className={styles.panelBadge}>12 days</span>
          </div>
          <DailySpendChart labels={spendTrend.labels} values={spendTrend.values} />
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.metaLabel}>Categories</span>
              <h2>Spend by category</h2>
            </div>
          </div>
          <CategoryMixChart categories={categories} />
        </article>
      </section>

      <section className={`${styles.contain} ${styles.bottom}`}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.metaLabel}>Primary</span>
              <h2>Inbox</h2>
            </div>
            <span className={styles.panelBadge}>{inboxBadge}</span>
          </div>

          <InboxSearchBar categoryNames={expenseCategoryNames} onSearch={setInboxFilters} />

          <div className={styles.transactionList}>
            {filteredTransactions.length === 0 ? (
              <p className={styles.inboxEmpty}>
                No transactions match these filters. Choose &quot;All categories&quot;, clear the
                keyword, and search again—or try different terms.
              </p>
            ) : (
              filteredTransactions.map((transaction) => (
                <ParsedEmailRow
                  key={`${transaction.merchant}-${transaction.timestamp}`}
                  transaction={transaction}
                  amountLabel={formatCurrency(transaction.amount)}
                />
              ))
            )}
          </div>
        </article>

        <div className={styles.sideStack}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.metaLabel}>Status</span>
                <h2>Pipeline</h2>
              </div>
            </div>
            <div className={styles.signalList}>
              {inboxSignals.map((signal) => (
                <div key={signal.label} className={styles.signalRow}>
                  <div className={styles.rowBody}>
                    <h3>{signal.label}</h3>
                    <p>{signal.detail}</p>
                  </div>
                  <strong>{signal.value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.metaLabel}>Labels</span>
                <h2>Watchlist</h2>
              </div>
            </div>
            <div className={styles.watchlist}>
              {merchantWatchlist.map((item) => (
                <div key={item.merchant} className={styles.watchlistRow}>
                  <div className={styles.rowBody}>
                    <h3>{item.merchant}</h3>
                    <p>{item.detail}</p>
                  </div>
                  <span>{item.amount}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
