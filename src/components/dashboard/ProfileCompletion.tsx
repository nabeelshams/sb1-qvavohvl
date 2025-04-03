import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ProfileCompletionProps {
  percentage: number;
  missingFields: string[];
}

export function ProfileCompletion({ percentage, missingFields }: ProfileCompletionProps) {
  if (missingFields.length === 0) return null;

  return (
    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20">
      <h3 className="text-lg font-semibold mb-4">Profile Completion</h3>
      <div className="space-y-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 rounded-full h-2 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div>
          <p className="text-gray-400 mb-2">
            Complete these sections to improve your profile:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missingFields.map((field) => (
              <div
                key={field}
                className="flex items-center gap-2 p-3 bg-white/5 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="capitalize">
                  {field.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}