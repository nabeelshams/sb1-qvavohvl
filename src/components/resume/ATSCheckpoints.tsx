import React from 'react';
import { ATSScoreData } from '../../types/atsScore';
import { CheckCircle } from 'lucide-react';

interface ATSCheckpointsProps {
  data: ATSScoreData | null;
}

export function ATSCheckpoints({ data }: ATSCheckpointsProps) {
  if (!data) {
    return (
      <div className="p-6 text-center text-gray-400">
        No ATS data available
      </div>
    );
  }

  // Filter out the "Total Score" entry and sort remaining entries
  const checkpoints = Object.entries(data)
    .filter(([key]) => key !== "Total Score")
    .sort((a, b) => b[1]["Achieved Score"] / b[1]["Max Score"] - a[1]["Achieved Score"] / a[1]["Max Score"]);

  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 px-4 text-left text-sm font-semibold">Check Points</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Score</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Justification</th>
              <th className="py-3 px-4 text-left text-sm font-semibold">Suggestion</th>
            </tr>
          </thead>
          <tbody>
            {checkpoints.map(([key, value]) => {
              const percentage = (value["Achieved Score"] / value["Max Score"]) * 100;
              const scoreColor = 
                percentage >= 80 ? 'text-green-400' :
                percentage >= 60 ? 'text-yellow-400' :
                'text-red-400';

              return (
                <tr key={key} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${scoreColor}`} />
                      <span>{key}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`font-semibold ${scoreColor}`}>
                      {value["Achieved Score"]}/{value["Max Score"]} ({percentage.toFixed(1)}%)
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-300">{value["Justification"]}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-blue-300">{value["Suggestion"]}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}