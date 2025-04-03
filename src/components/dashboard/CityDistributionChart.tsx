import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../dashboard/ChartConfig';

interface CityDistributionChartProps {
  data: {
    [key: string]: number;
  };
}

export function CityDistributionChart({ data }: CityDistributionChartProps) {
  // Sort cities by job count (descending) and take top 10
  const sortedCities = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const chartData = {
    labels: sortedCities.map(([city]) => city),
    datasets: [{
      label: 'Number of Jobs',
      data: sortedCities.map(([, count]) => count),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 1
    }]
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20">
      <h3 className="text-lg font-semibold mb-4">Jobs by City</h3>
      <div className="h-64">
        <Bar 
          data={chartData}
          options={{
            indexAxis: 'y', // Make it a horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  color: 'white'
                },
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)'
                }
              },
              y: {
                ticks: {
                  color: 'white'
                },
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.parsed.x} jobs`
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}