import { useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import styles from "./NoTransactionsPlaceholder.module.css";

type NoTransactionsPlaceholderProps = {
  fetchEmails: () => void | Promise<void>;
};

export function NoTransactionsPlaceholder({
  fetchEmails,
}: NoTransactionsPlaceholderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      await fetchEmails();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.placeholderShell}>
        <div className={styles.placeholderCard}>
          <p className={styles.placeholderTitle}>Syncing emails</p>
          <p className={styles.placeholderBody}>
            Pulling in your first transactions. This only takes a moment.
          </p>
          <div style={{display: "flex", justifyContent: "center", paddingTop: "10px"}}>
          <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.placeholderShell}>
      <div className={styles.placeholderCard}>
        <p className={styles.placeholderEyebrow}>Inbox empty</p>
        <h1 className={styles.placeholderTitle}>No transactions found</h1>
        <p className={styles.placeholderBody}>
          Click below to fetch your first emails and start sorting transactions.
        </p>
        <button
          type="button"
          className={styles.placeholderButton}
          onClick={handleClick}
        >
          Sync emails
        </button>
      </div>
    </div>
  );
}
