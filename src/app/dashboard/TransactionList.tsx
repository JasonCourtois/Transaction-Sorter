import { useState, useEffect } from "react";
import { Transaction } from "./dashboard.types";
import styles from "./DashboardShell.module.css";
import { ParsedEmailRow } from "./ParsedEmailRow";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [page, setPage] = useState(1);

  const MAX_EMAILS_PER_PAGE = 8;

  // Reset current page back to the first page whenever transactions is updated.
  useEffect(() => {
    setPage(1);
  }, [transactions])

  return (
    <div className={styles.transactionList}>
      {transactions.length === 0 ? (
        <p className={styles.inboxEmpty}>
          No transactions match these filters. Choose &quot;All categories&quot;, clear the keyword,
          and search again—or try different terms.
        </p>
      ) : (
        transactions
          .slice((page - 1) * MAX_EMAILS_PER_PAGE, page * MAX_EMAILS_PER_PAGE)
          .map((transaction) => (
            <ParsedEmailRow
              key={`${transaction.merchant}-${transaction.date}`}
              transaction={transaction}
              amountLabel={formatCurrency(transaction.amount)}
            />
          ))
      )}
      {transactions.length > MAX_EMAILS_PER_PAGE && (
        <div className={styles.transactionPageButtonContainer}>
          <button disabled={page == 1} onClick={() => setPage(page - 1)} className={styles.transactionPageButton}>{"<"}</button>
          <button disabled={page * MAX_EMAILS_PER_PAGE >= transactions.length} onClick={() => setPage(page + 1)} className={styles.transactionPageButton}>{">"}</button>
        </div>
      )}
    </div>
  );
}
