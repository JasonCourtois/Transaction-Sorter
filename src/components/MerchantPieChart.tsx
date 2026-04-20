import ReactECharts from "echarts-for-react";
import type { Transaction } from "../app/dashboard/dashboard.types";
import styles from "@/app/dashboard/DashboardShell.module.css";

type MerchantPieChartProps = {
  transactions: Transaction[];
};

const categoryColors = ["#1a73e8", "#188038", "#9334e6", "#ea8600", "#d93025", "#5f6368"];

export function MerchantPieChart({ transactions }: MerchantPieChartProps) {
  const MAX_MERCHANT_SEGMENTS = 8;

  const merchantBreakdown = Object.entries(
    transactions.reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.merchant] = (totals[transaction.merchant] ?? 0) + transaction.amount;
      return totals;
    }, {}),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const topMerchantBreakdown = merchantBreakdown.slice(0, MAX_MERCHANT_SEGMENTS);
  const otherMerchantTotal = merchantBreakdown
    .slice(MAX_MERCHANT_SEGMENTS)
    .reduce((total, merchant) => total + merchant.value, 0);
  const segments =
    otherMerchantTotal > 0
      ? [...topMerchantBreakdown, { name: "Other", value: otherMerchantTotal }]
      : topMerchantBreakdown;

  const option = {
    backgroundColor: "transparent",
    color: categoryColors,
    tooltip: {
      trigger: "item",
      backgroundColor: "#ffffff",
      borderColor: "#dadce0",
      borderWidth: 1,
      textStyle: {
        color: "#202124",
        fontSize: 12,
      },
      formatter: "{b}: ${c} ({d}%)",
    },
    legend: {
      bottom: 0,
      icon: "circle",
      textStyle: {
        color: "#5f6368",
        fontSize: 12,
      },
    },
    series: [
      {
        type: "pie",
        radius: ["52%", "72%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          scale: false,
          label: {
            show: false,
          },
        },
        data: segments,
      },
    ],
  };

  return <ReactECharts className={styles.donutChart} option={option} opts={{ renderer: "svg" }} />;
}
