"use client";

import { CategoryMixChart } from "./CategoryMixChart";
import { DailySpendChart } from "./DailySpendChart";
import categoriesData from "./data/categories.json";
import inboxSignalsData from "./data/inbox-signals.json";
import merchantWatchlistData from "./data/merchant-watchlist.json";
import spendTrendData from "./data/spend-trend.json";
import transactionsData from "./data/transactions.json";
import { ParsedEmailRow } from "./ParsedEmailRow";
import type {
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

const spendTotal = transactions.reduce(
  (total, transaction) => total + transaction.amount,
  0,
);

const averageConfidence = Math.round(
  transactions.reduce(
    (total, transaction) => total + transaction.confidence,
    0,
  ) / transactions.length,
);

const topCategory = categories.reduce((highest, category) =>
  category.value > highest.value ? category : highest,
);

const categoryTotal = categories.reduce(
  (total, category) => total + category.value,
  0,
);

const topCategoryShare = Math.round((topCategory.value / categoryTotal) * 100);
const parsedEmailCount = transactions.length;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function DashboardShell() {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-shell__hero">
        <div className="dashboard-shell__hero-copy">
          <span className="dashboard-shell__eyebrow">
            AI receipt intelligence
          </span>
          <h1>See every purchase the moment it lands in your inbox.</h1>
          <p>
            Mock data preview for your Firebase-backed transaction sorter. The
            dashboard surfaces parsed receipts, category trends, and the
            purchases worth noticing first.
          </p>
        </div>
        <div className="dashboard-shell__actions">
          <button className="dashboard-shell__primary-action">
            Connect Gmail Later
          </button>
          <button className="dashboard-shell__secondary-action">
            View Parsing Queue
          </button>
        </div>
      </section>

      <section className="dashboard-shell__kpis">
        <article className="dashboard-shell__kpi-card">
          <span className="dashboard-shell__kpi-label">Detected spend</span>
          <strong>{formatCurrency(spendTotal)}</strong>
          <p>Across the most recent 6 receipt emails.</p>
        </article>
        <article className="dashboard-shell__kpi-card">
          <span className="dashboard-shell__kpi-label">
            Average AI confidence
          </span>
          <strong>{averageConfidence}%</strong>
          <p>Merchant, total, and summary extraction quality.</p>
        </article>
        <article className="dashboard-shell__kpi-card">
          <span className="dashboard-shell__kpi-label">Top category</span>
          <strong>{topCategory.name}</strong>
          <p>{topCategoryShare}% of this month&apos;s total mock spend.</p>
        </article>
        <article className="dashboard-shell__kpi-card dashboard-shell__highlight-card">
          <span className="dashboard-shell__kpi-label">Parsed emails</span>
          <strong>{parsedEmailCount}</strong>
          <p>Receipts currently represented in this dashboard preview.</p>
        </article>
      </section>

      <section className="dashboard-shell__analytics">
        <article className="dashboard-shell__panel dashboard-shell__panel--large">
          <div className="dashboard-shell__panel-header">
            <div>
              <span className="dashboard-shell__panel-eyebrow">
                Spending trend
              </span>
              <h2>Daily spend across parsed emails</h2>
            </div>
            <span className="dashboard-shell__panel-badge">Last 12 days</span>
          </div>
          <DailySpendChart
            labels={spendTrend.labels}
            values={spendTrend.values}
          />
        </article>

        <article className="dashboard-shell__panel">
          <div className="dashboard-shell__panel-header">
            <div>
              <span className="dashboard-shell__panel-eyebrow">
                Category mix
              </span>
              <h2>Where money is landing</h2>
            </div>
          </div>
          <CategoryMixChart categories={categories} />
        </article>
      </section>

      <section className="dashboard-shell__bottom">
        <article className="dashboard-shell__panel dashboard-shell__panel--transactions">
          <div className="dashboard-shell__panel-header">
            <div>
              <span className="dashboard-shell__panel-eyebrow">
                Recent activity
              </span>
              <h2>Latest parsed transactions</h2>
            </div>
            <span className="dashboard-shell__panel-badge">Mock dataset</span>
          </div>

          <div className="dashboard-shell__transaction-list">
            {transactions.map((transaction) => (
              <ParsedEmailRow
                key={`${transaction.merchant}-${transaction.timestamp}`}
                transaction={transaction}
                amountLabel={formatCurrency(transaction.amount)}
              />
            ))}
          </div>
        </article>

        <div className="dashboard-shell__side-stack">
          <article className="dashboard-shell__panel">
            <div className="dashboard-shell__panel-header">
              <div>
                <span className="dashboard-shell__panel-eyebrow">
                  Inbox health
                </span>
                <h2>Pipeline snapshot</h2>
              </div>
            </div>
            <div className="dashboard-shell__signal-list">
              {inboxSignals.map((signal) => (
                <div key={signal.label} className="dashboard-shell__signal-row">
                  <div>
                    <h3>{signal.label}</h3>
                    <p>{signal.detail}</p>
                  </div>
                  <strong>{signal.value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="dashboard-shell__panel">
            <div className="dashboard-shell__panel-header">
              <div>
                <span className="dashboard-shell__panel-eyebrow">
                  Smart prompts
                </span>
                <h2>Merchant watchlist</h2>
              </div>
            </div>
            <div className="dashboard-shell__watchlist">
              {merchantWatchlist.map((item) => (
                <div
                  key={item.merchant}
                  className="dashboard-shell__watchlist-row"
                >
                  <div>
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
