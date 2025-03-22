import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        <h2 className="text-2xl font-bold text-blue-300">Loading Jobs</h2>
        <p className="text-gray-400">Please wait while we load your job opportunities...</p>
      </div>
    </div>
  );
}