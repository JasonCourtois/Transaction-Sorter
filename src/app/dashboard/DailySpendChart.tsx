import ReactECharts from "echarts-for-react";

type DailySpendChartProps = {
  labels: string[];
  values: number[];
};

export function DailySpendChart({
  labels,
  values,
}: DailySpendChartProps) {
  const option = {
    backgroundColor: "transparent",
    color: ["#8ab4f8"],
    grid: {
      left: 8,
      right: 8,
      top: 24,
      bottom: 24,
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(32, 33, 36, 0.96)",
      borderColor: "rgba(95, 99, 104, 0.4)",
      textStyle: {
        color: "#e8eaed",
      },
      valueFormatter: (value: number) => `$${value.toFixed(2)}`,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: labels,
      axisLabel: {
        color: "#9aa0a6",
        fontSize: 11,
      },
      axisLine: {
        lineStyle: {
          color: "rgba(95, 99, 104, 0.42)",
        },
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#9aa0a6",
        formatter: (value: number) => `$${value}`,
      },
      splitLine: {
        lineStyle: {
          color: "rgba(95, 99, 104, 0.18)",
        },
      },
    },
    series: [
      {
        data: values,
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: "#8ab4f8",
        },
        itemStyle: {
          color: "#202124",
          borderColor: "#8ab4f8",
          borderWidth: 1.5,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(138, 180, 248, 0.18)" },
              { offset: 1, color: "rgba(138, 180, 248, 0.01)" },
            ],
          },
        },
      },
    ],
  };

  return (
    <ReactECharts
      className="dashboard-shell__chart"
      option={option}
      opts={{ renderer: "svg" }}
    />
  );
}
