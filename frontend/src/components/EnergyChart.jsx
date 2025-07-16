import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import "chartjs-adapter-date-fns";

Chart.register(...registerables);

const EnergyChart = ({ data, filter, dateParam }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext("2d");
      let labels, chartData, labelText;

      // Jika data berupa array angka (realtime)
      if (typeof data[0] === "number") {
        labels = data.map((_, idx) => idx + 1);
        chartData = data;
        labelText = "Realtime Energy";
      } else if (filter === "daily") {
        labels = data.map((item) => {
          const time = new Date(`1970-01-01T${item.waktu}`);
          return time;
        });
        chartData = data.map((item) => parseFloat(item.jumlah));
        labelText = "Hourly Energy Consumption (kWh)";
      } else {
        labels = data.map((item) => new Date(item.date));
        chartData = data.map((item) => parseFloat(item.total));
        labelText =
          filter === "weekly"
            ? "Daily Energy Consumption (kWh)"
            : "Daily Energy Consumption (kWh)";
      }

      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: labelText,
              data: chartData,
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 2,
              pointBackgroundColor: "rgba(59, 130, 246, 1)",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "rgba(59, 130, 246, 1)",
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
              ticks: {
                callback: function (value) {
                  return value + " kWh";
                },
              },
            },
            x: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `Consumption: ${context.parsed.y.toFixed(2)} kWh`;
                },
              },
            },
          },
        },
      });
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, filter, dateParam]);

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef} />
    </div>
  );
};

export default EnergyChart;
