export type InboxSearchFilters = {
  category: string;
  keyword: string;
};

export type Transaction = {
  merchant: string;
  category: string;
  amount: number;
  summary: string;
  source: string;
  date: string;
  confidence: number;
};

export type SpendTrendData = {
  labels: string[];
  values: number[];
};

export type SpendBreakdownItem = {
  value: number;
  name: string;
};

export type InboxSignal = {
  label: string;
  value: string;
  detail: string;
};

export type MerchantWatchlistItem = {
  merchant: string;
  detail: string;
  amount: string;
};
