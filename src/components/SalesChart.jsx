import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

const SalesChart = ({ data }) => {
  // Procesar datos por mes
  const salesByMonth = {};
  
  data.forEach(venta => {
    const fecha = new Date(venta.fecha);
    const monthYear = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
    
    if (!salesByMonth[monthYear]) {
      salesByMonth[monthYear] = 0;
    }
    salesByMonth[monthYear] += venta.total;
  });

  const labels = Object.keys(salesByMonth).sort((a, b) => 
    new Date(a.split(' ')[1] + ' 1, ' + a.split(' ')[0]) - 
    new Date(b.split(' ')[1] + ' 1, ' + b.split(' ')[0])
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Ventas ($)',
        data: labels.map(month => salesByMonth[month]),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SalesChart;
