import ReactECharts from "echarts-for-react";
import type { SpendCategory } from "./dashboard.types";

type CategoryMixChartProps = {
  categories: SpendCategory[];
};

const categoryColors = [
  "#8ab4f8",
  "#81c995",
  "#a1c2fa",
  "#89b3a4",
  "#c58af9",
  "#fbc86b",
];

export function CategoryMixChart({
  categories,
}: CategoryMixChartProps) {
  const option = {
    backgroundColor: "transparent",
    color: categoryColors,
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(32, 33, 36, 0.96)",
      borderColor: "rgba(95, 99, 104, 0.4)",
      textStyle: {
        color: "#e8eaed",
      },
      formatter: "{b}: ${c} ({d}%)",
    },
    legend: {
      bottom: 0,
      icon: "circle",
      textStyle: {
        color: "#bdc1c6",
      },
    },
    series: [
      {
        type: "pie",
        radius: ["58%", "78%"],
        center: ["50%", "44%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: "#202124",
          borderWidth: 4,
        },
        label: {
          show: false,
        },
        emphasis: {
          scale: true,
          label: {
            show: false,
          },
        },
        data: categories,
      },
    ],
  };

  return (
    <ReactECharts
      className="dashboard-shell__donut-chart"
      option={option}
      opts={{ renderer: "svg" }}
    />
  );
}
