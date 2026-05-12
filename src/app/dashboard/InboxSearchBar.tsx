"use client";

import { useCallback, useState } from "react";
import type { InboxSearchFilters } from "./dashboard.types";
import styles from "./DashboardShell.module.css";
import { formatCategory } from "./formatCategory";

type InboxSearchBarProps = {
  categoryNames: readonly string[];
  onSearch: (filters: InboxSearchFilters) => void;
};

export function InboxSearchBar({
  categoryNames,
  onSearch,
}: InboxSearchBarProps) {
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");

  const submit = useCallback(() => {
    onSearch({ category, keyword: keyword.trim() });
  }, [category, keyword, onSearch]);

  return (
    <div className={styles.inboxSearch}>
      <form
        className={styles.inboxSearchForm}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        role="search"
        aria-label="Search transactions"
      >
        <label className={styles.inboxSearchLabel}>
          <span className={styles.inboxSearchLabelText}>Category</span>
          <select
            className={styles.inboxSearchSelect}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Expense category"
          >
            <option value="">All categories</option>
            {categoryNames.map((name) => (
              <option key={name} value={name}>
                {formatCategory(name)}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.inboxSearchKeywordWrap}>
          <span className={styles.inboxSearchLabelText}>Keyword</span>
          <input
            className={styles.inboxSearchInput}
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Merchant, summary, source…"
            autoComplete="off"
            aria-label="Search keyword"
          />
        </label>
        <button type="submit" className={styles.inboxSearchButton}>
          Search
        </button>
      </form>
    </div>
  );
}
