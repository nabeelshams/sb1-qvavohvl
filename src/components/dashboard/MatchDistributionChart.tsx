import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import '../dashboard/ChartConfig';

interface MatchDistributionChartProps {
  data: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

export function MatchDistributionChart({ data }: MatchDistributionChartProps) {
  const chartData = {
    labels: ['Excellent (>80%)', 'Good (60-80%)', 'Fair (40-60%)', 'Poor (<40%)'],
    datasets: [{
      data: [
        data.excellent,
        data.good,
        data.fair,
        data.poor
      ],
      backgroundColor: [
        'rgba(34, 197, 94, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(234, 179, 8, 0.6)',
        'rgba(239, 68, 68, 0.6)'
      ],
      borderColor: [
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(234, 179, 8)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20">
      <h3 className="text-lg font-semibold mb-4">Match Distribution</h3>
      <div className="h-64">
        <Doughnut 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  color: 'white'
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}