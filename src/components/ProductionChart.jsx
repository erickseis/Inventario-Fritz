import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const ProductionChart = ({ data }) => {
  // Procesar datos por mes
  const productionByMonth = {};

  data.forEach((prod) => {
    const fecha = new Date(prod.fecha);
    const monthYear = fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
    });

    if (!productionByMonth[monthYear]) {
      productionByMonth[monthYear] = 0;
    }
    productionByMonth[monthYear] += prod.cantidad;
  });

  const labels = Object.keys(productionByMonth).sort(
    (a, b) =>
      new Date(`${a.split(" ")[1]} 1, ${a.split(" ")[0]}`) -
      new Date(`${b.split(" ")[1]} 1, ${b.split(" ")[0]}`),
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Unidades Producidas",
        data: labels.map((month) => productionByMonth[month]),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value} un`,
        },
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ProductionChart;
