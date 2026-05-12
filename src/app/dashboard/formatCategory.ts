const labels: Record<string, string> = {
  food_dining: "Food & Dining",
  shopping: "Shopping",
  travel_transport: "Travel & Transport",
  entertainment: "Entertainment",
  bills_utilities: "Bills & Utilities",
  health: "Health",
  subscriptions: "Subscriptions",
  education: "Education",
  other: "Other",
};

export function formatCategory(slug: string): string {
  return labels[slug] ?? slug;
}
