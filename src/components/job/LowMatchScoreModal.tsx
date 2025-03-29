import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface LowMatchScoreModalProps {
  matchScore: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LowMatchScoreModal({ matchScore, onConfirm, onCancel }: LowMatchScoreModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold">Low Match Score Warning</h3>
              <button
                onClick={onCancel}
                className="p-1 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 mt-4">
              The job match score ({matchScore.toFixed(1)}%) is below our recommended threshold of 60%.
            </p>
            <p className="text-gray-400 mt-2">
              For best results, we recommend optimizing your resume for jobs with a higher match score. 
              This ensures the optimization process has enough relevant context to create an effective resume.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}