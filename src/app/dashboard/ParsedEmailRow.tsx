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
    <div className="dashboard-shell__transaction-row">
      <div className="dashboard-shell__transaction-meta">
        <div className="dashboard-shell__transaction-topline">
          <h3>{transaction.merchant}</h3>
          <span
            className={
              transaction.status === "Parsed"
                ? "dashboard-shell__status--parsed"
                : "dashboard-shell__status--flagged"
            }
          >
            {transaction.status}
          </span>
        </div>
        <p>{transaction.summary}</p>
        <div className="dashboard-shell__transaction-details">
          <span>{transaction.category}</span>
          <span>{transaction.source}</span>
          <span>{transaction.timestamp}</span>
          <span>{transaction.confidence}% confidence</span>
        </div>
      </div>
      <strong className="dashboard-shell__transaction-amount">
        {amountLabel}
      </strong>
    </div>
  );
}
