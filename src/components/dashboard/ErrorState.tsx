import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-900/30 backdrop-blur-sm p-8 rounded-lg shadow-xl ring-1 ring-red-500/20">
          <div className="flex items-center gap-4 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <h2 className="text-2xl font-bold text-red-400">Error Loading Dashboard</h2>
          </div>
          <p className="text-red-200 mb-6">{error}</p>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}