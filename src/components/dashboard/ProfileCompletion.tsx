import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ProfileCompletionProps {
  percentage: number;
  missingFields: string[];
  onClose?: () => void;
}

export function ProfileCompletion({ percentage, missingFields, onClose }: ProfileCompletionProps) {
  if (missingFields.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">CV Completion</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-500 rounded-full h-2 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div>
        <p className="text-gray-400 mb-4">
          Complete these sections to improve your CV:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  );
}