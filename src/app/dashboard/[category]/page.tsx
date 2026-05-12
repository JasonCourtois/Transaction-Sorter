"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import categoriesData from "../data/categories.json";
import type { SpendBreakdownItem, Transaction } from "../dashboard.types";
import styles from "../DashboardShell.module.css";
import { MerchantPieChart } from "@/components/MerchantPieChart";
import { DailySpendChart } from "@/components/DailySpendChart";
import { TransactionList } from "../TransactionList";
import { formatCategory } from "../formatCategory";

export default function Category() {
  const params = useParams<{ category: string }>();

  const categories = categoriesData as SpendBreakdownItem[];
  const category = params.category.toLowerCase();
  const capitalizedCategory = formatCategory(category);

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("transactions");
      if (cached) setAllTransactions(JSON.parse(cached));
    } catch {}
  }, []);

  const transactions = allTransactions.filter(
    (item) => item.category.toLowerCase() === category,
  );

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
          <DailySpendChart transactions={transactions} />
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.metaLabel}>Merchants</span>
              <h2>{capitalizedCategory} Spend by Merchant</h2>
            </div>
          </div>
          <MerchantPieChart transactions={transactions} />
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
