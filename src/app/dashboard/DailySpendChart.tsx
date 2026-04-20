import ReactECharts from "echarts-for-react";
import styles from "./DashboardShell.module.css";

type DailySpendChartProps = {
  labels: string[];
  values: number[];
};

const lineColor = "#1a73e8";
const axisMuted = "#5f6368";
const gridLine = "#e8eaed";

export function DailySpendChart({
  labels,
  values,
}: DailySpendChartProps) {
  const option = {
    backgroundColor: "transparent",
    color: [lineColor],
    grid: {
      left: 8,
      right: 8,
      top: 24,
      bottom: 24,
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#ffffff",
      borderColor: "#dadce0",
      borderWidth: 1,
      textStyle: {
        color: "#202124",
        fontSize: 12,
      },
      valueFormatter: (value: number) => `$${value.toFixed(2)}`,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: labels,
      axisLabel: {
        color: axisMuted,
        fontSize: 11,
      },
      axisLine: {
        lineStyle: {
          color: gridLine,
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: axisMuted,
        formatter: (value: number) => `$${value}`,
      },
      splitLine: {
        lineStyle: {
          color: gridLine,
        },
      },
    },
    series: [
      {
        data: values,
        type: "line",
        smooth: false,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: {
          width: 2,
          color: lineColor,
        },
        itemStyle: {
          color: "#ffffff",
          borderColor: lineColor,
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(26, 115, 232, 0.12)" },
              { offset: 1, color: "rgba(26, 115, 232, 0.02)" },
            ],
          },
        },
      },
    ],
  };

  return (
    <ReactECharts
      className={styles.chart}
      option={option}
      opts={{ renderer: "svg" }}
    />
  );
}
