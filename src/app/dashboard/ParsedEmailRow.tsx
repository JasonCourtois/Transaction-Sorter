import styles from "./DashboardShell.module.css";
import type { Transaction } from "./dashboard.types";

type ParsedEmailRowProps = {
  transaction: Transaction;
  amountLabel: string;
};

export function ParsedEmailRow({
  transaction,
  amountLabel,
}: ParsedEmailRowProps) {
  return (
    <div className={styles.transactionRow}>
      <div className={styles.transactionMeta}>
        <div className={styles.transactionTopline}>
          <h3>{transaction.merchant}</h3>
        </div>
        <p>{transaction.summary}</p>
        <div className={styles.transactionDetails}>
          <span>{transaction.category}</span>
          <span>{transaction.source}</span>
          <span>{transaction.date}</span>
          <span>{transaction.confidence}% confidence</span>
        </div>
      </div>
      <strong className={styles.transactionAmount}>{amountLabel}</strong>
    </div>
  );
}
