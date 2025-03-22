import React from 'react';
import { Building2, Loader2 } from 'lucide-react';

interface EmptyStateProps {
  activeTab: 'new' | 'previous';
  isSearching: boolean;
}

export function EmptyState({ activeTab, isSearching }: EmptyStateProps) {
  return (
    <div className="bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-xl ring-1 ring-white/20 flex flex-col items-center gap-4 text-center">
      {activeTab === 'new' && isSearching ? (
        <>
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <h2 className="text-2xl font-bold text-blue-300">Searching for Jobs</h2>
          <p className="text-gray-400 max-w-md">
            We're actively searching for jobs matching your criteria. 
            New opportunities will appear here as soon as they're found.
          </p>
        </>
      ) : (
        <>
          <Building2 className="w-16 h-16 text-blue-500" />
          <h2 className="text-2xl font-bold text-blue-300">No Jobs Found</h2>
          <p className="text-gray-400 max-w-md">
            {activeTab === 'new' 
              ? "No new job opportunities found yet. Start a new job search to find matching positions."
              : "No previous job opportunities found. Start a new job search to see matching positions."}
          </p>
        </>
      )}
    </div>
  );
}