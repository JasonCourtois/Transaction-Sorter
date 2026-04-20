"use client";

import { useParams, notFound } from "next/navigation";
import categoriesData from "../data/categories.json";
import transactionsData from "../data/transactions.json";
import type { SpendCategory, Transaction } from "../dashboard.types";
import styles from "../DashboardShell.module.css";
import { ParsedEmailRow } from "../ParsedEmailRow";
import { formatCurrency } from "../DashboardShell";

export default function Category() {
  const params = useParams<{ category: string }>();

  const categories = categoriesData as SpendCategory[];
  const category = params.category.toLowerCase();

  const transactions = (transactionsData as Transaction[]).filter(item => item.category.toLowerCase() === category);

  const isValidCategory = () => {
    return categories.some((item) => item.name.toLowerCase() === category);
  };

  if (!isValidCategory()) {
    notFound();
  }

  return (
    <div className={styles.shell}>
            <section className={`${styles.contain} ${styles.bottom}`}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.metaLabel}>Primary</span>
              <h2>Inbox</h2>
            </div>
          </div>

          <div className={styles.transactionList}>
            {transactions.map((transaction) => (
                <ParsedEmailRow
                  key={`${transaction.merchant}-${transaction.timestamp}`}
                  transaction={transaction}
                  amountLabel={formatCurrency(transaction.amount)}
                />
              ))
            }
          </div>
        </article>
      </section>
    </div>
  );
}
