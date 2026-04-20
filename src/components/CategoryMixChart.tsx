import ReactECharts from "echarts-for-react";
import type { SpendCategory } from "../app/dashboard/dashboard.types";
import styles from "@/app/dashboard/DashboardShell.module.css";

type CategoryMixChartProps = {
  categories: SpendCategory[];
};

const categoryColors = ["#1a73e8", "#188038", "#9334e6", "#ea8600", "#d93025", "#5f6368"];

export function CategoryMixChart({ categories }: CategoryMixChartProps) {
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
        data: categories,
      },
    ],
  };

  return <ReactECharts className={styles.donutChart} option={option} opts={{ renderer: "svg" }} />;
}
