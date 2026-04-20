"use client";

import { useParams, notFound } from "next/navigation";
import categoriesData from "../data/categories.json";
import transactionsData from "../data/transactions.json";
import type { SpendBreakdownItem, Transaction } from "../dashboard.types";
import styles from "../DashboardShell.module.css";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { DailySpendChart } from "@/components/DailySpendChart";
import { TransactionList } from "../TransactionList";

const MAX_MERCHANT_SEGMENTS = 8;

export default function Category() {
  const params = useParams<{ category: string }>();

  const categories = categoriesData as SpendBreakdownItem[];
  const category = params.category.toLowerCase();
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  const transactions = (transactionsData as Transaction[]).filter(
    (item) => item.category.toLowerCase() === category,
  );

  const dailySpendByDate = Object.entries(
    transactions.reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.date] = (totals[transaction.date] ?? 0) + transaction.amount;
      return totals;
    }, {}),
  ).sort(([dateA], [dateB]) => dateA.localeCompare(dateB));
  const dailySpendLabels = dailySpendByDate.map(([date]) => date);
  const dailySpendValues = dailySpendByDate.map(([, value]) => value);

  const merchantBreakdown = Object.entries(
    transactions.reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.merchant] = (totals[transaction.merchant] ?? 0) + transaction.amount;
      return totals;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const topMerchantBreakdown = merchantBreakdown.slice(0, MAX_MERCHANT_SEGMENTS);
  const otherMerchantTotal = merchantBreakdown
    .slice(MAX_MERCHANT_SEGMENTS)
    .reduce((total, merchant) => total + merchant.value, 0);
  const merchantChartSegments =
    otherMerchantTotal > 0
      ? [...topMerchantBreakdown, { name: "Other", value: otherMerchantTotal }]
      : topMerchantBreakdown;

  const isValidCategory = () => {
    return categories.some((item) => item.name.toLowerCase() === category);
  };

  if (!isValidCategory()) {
    notFound();
  }

  return (
    <div className={styles.shell}>
      <section className={`${styles.contain} ${styles.analytics}`}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.metaLabel}>Charts</span>
              <h2>Daily Spend on {capitalizedCategory}</h2>
            </div>
          </div>
          <DailySpendChart labels={dailySpendLabels} values={dailySpendValues} />
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.metaLabel}>Merchants</span>
              <h2>{capitalizedCategory} Spend by Merchant</h2>
            </div>
          </div>
          <CategoryPieChart segments={merchantChartSegments} />
        </article>
      </section>
      <section className={`${styles.contain} ${styles.bottom}`}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>{capitalizedCategory} Transactions</h2>
            </div>
          </div>

          <TransactionList transactions={transactions} />
        </article>
      </section>
    </div>
  );
}
