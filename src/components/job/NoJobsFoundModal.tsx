import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NoJobsFoundModalProps {
  onClose: () => void;
}

export function NoJobsFoundModal({ onClose }: NoJobsFoundModalProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold">No Jobs Found</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 mt-4">
              No jobs relevant to your desired job title could be found.
            </p>
            <p className="text-gray-400 mt-2">
              Please try again after some time or try searching for a different job title.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => navigate('/job-search-rule')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Update Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}