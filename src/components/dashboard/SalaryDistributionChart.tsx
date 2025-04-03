import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../dashboard/ChartConfig';

interface SalaryDistributionChartProps {
  data: {
    [key: string]: number;
  };
}

export function SalaryDistributionChart({ data }: SalaryDistributionChartProps) {
  const chartData = {
    labels: Object.keys(data),
    datasets: [{
      label: 'Number of Jobs',
      data: Object.values(data),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20">
      <h3 className="text-lg font-semibold mb-4">Salary Distribution</h3>
      <div className="h-64">
        <Bar 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: 'white'
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                }
              },
              x: {
                ticks: {
                  color: 'white'
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }}
        />
      </div>
    </div>
  );
}