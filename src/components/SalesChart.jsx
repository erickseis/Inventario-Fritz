import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
);

const SalesChart = ({
  data,
  mode = "monthly",
  items = [],
  orientation = "vertical",
}) => {
  // modo por defecto: línea mensual por ventas ($)
  if (mode === "topItems") {
    const labels = items.map((i) => i.label.trim());
    const values = items.map((i) => i.value);

    const chartData = {
      labels,
      datasets: [
        {
          label: "Cajas vendidas",
          data: values,
          backgroundColor: "rgba(25, 135, 84, 0.6)",
          borderColor: "rgba(25, 135, 84, 1)",
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: false },
      },
      scales: {
        y: { beginAtZero: true },
      },
    };

    const indexAxis = orientation === "horizontal" ? "y" : "x";
    const dynamicHeight = Math.max(300, labels.length * 48);
    const barOptions = { ...options, indexAxis };

    return (
      <div style={{ height: `${dynamicHeight}px` }}>
        <Bar data={chartData} options={barOptions} />
      </div>
    );
  }

  // Procesar datos por mes (comportamiento anterior)
  const salesByMonth = {};
  (data || []).forEach((venta) => {
    const fecha = new Date(venta.fecha);
    const monthYear = fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
    });
    if (!salesByMonth[monthYear]) salesByMonth[monthYear] = 0;
    salesByMonth[monthYear] += venta.total;
  });

  const labels = Object.keys(salesByMonth).sort(
    (a, b) =>
      new Date(`${a.split(" ")[1]} 1, ${a.split(" ")[0]}`) -
      new Date(`${b.split(" ")[1]} 1, ${b.split(" ")[0]}`),
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Ventas ($)",
        data: labels.map((month) => salesByMonth[month]),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SalesChart;
