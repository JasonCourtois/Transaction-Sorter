import ReactECharts from "echarts-for-react";
import type { Transaction } from "../app/dashboard/dashboard.types";
import styles from "@/app/dashboard/DashboardShell.module.css";
import { formatCurrency } from "@/app/dashboard/TransactionList";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type CategoryPieChartProps = {
  transactions: Transaction[];
  setTopCategory?: (category: string) => void;
};

const categoryColors = ["#1a73e8", "#188038", "#9334e6", "#ea8600", "#d93025", "#5f6368"];

export function CategoryPieChart({ transactions, setTopCategory }: CategoryPieChartProps) {
  const router = useRouter();
  
  const categoryTotals: Record<string, number> = {};
  for (const transaction of transactions) {
    categoryTotals[transaction.category] =
      (categoryTotals[transaction.category] ?? 0) + transaction.amount;
  }

  const segments = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));
  
  useEffect(() => {
    if (setTopCategory) {
      const topCategory = Object.entries(categoryTotals).reduce(
        (maxCategory, [category, total]) =>
          total > maxCategory.total ? { category, total } : maxCategory,
        { category: "", total: Number.NEGATIVE_INFINITY },
      );

      setTopCategory(topCategory.category);
    }
  }, [categoryTotals, setTopCategory]);

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
      formatter: (params: { name: string; value: number; percent: number }) =>
        `${params.name}: ${formatCurrency(params.value)} (${params.percent}%)`,
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

  const onEvents = {
    click: (params: { componentType: string; seriesType: string; name: string; value: number }) => {
      if (params.componentType === "series" && params.seriesType === "pie") {
        router.push("/dashboard/" + params.name.toLowerCase());
      }
    },
  };

  return <ReactECharts className={styles.donutChart} option={option} onEvents={onEvents} opts={{ renderer: "svg" }} />;
}
