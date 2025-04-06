import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface SaveConfirmationModalProps {
  missingRecommended: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function SaveConfirmationModal({ missingRecommended, onConfirm, onCancel }: SaveConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold text-white">Missing Recommended Fields</h3>
              <button
                onClick={onCancel}
                className="p-1 hover:bg-gray-800 rounded-full transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-300 mt-4">
              The following recommended sections are incomplete:
            </p>
            <ul className="mt-2 space-y-1 text-gray-300">
              {missingRecommended.map((field, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-yellow-500 rounded-full" />
                  {field}
                </li>
              ))}
            </ul>
            <p className="text-gray-300 mt-4">
              These sections can improve your resume's effectiveness. Do you want to continue anyway?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
              >
                Save Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}