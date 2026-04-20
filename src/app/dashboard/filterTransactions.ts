import type { InboxSearchFilters, Transaction } from "./dashboard.types";

export function filterTransactions(
  items: readonly Transaction[],
  filters: InboxSearchFilters,
): Transaction[] {
  const keyword = filters.keyword.toLowerCase();

  return items.filter((t) => {
    if (filters.category && t.category !== filters.category) {
      return false;
    }
    if (!keyword) {
      return true;
    }
    const blob = [
      t.merchant,
      t.summary,
      t.source,
      t.date,
      t.category,
      String(t.amount),
      String(t.confidence),
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(keyword);
  });
}
