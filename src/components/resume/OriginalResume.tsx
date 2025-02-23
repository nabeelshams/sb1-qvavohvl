import React from 'react';
import { Loader2 } from 'lucide-react';
import { useOriginalCV } from '../../hooks/useOriginalCV';

interface OriginalResumeProps {
  userId: string;
}

export function OriginalResume({ userId }: OriginalResumeProps) {
  const { cvContent, loading, error } = useOriginalCV(userId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400">Loading original CV...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 p-4 rounded-lg">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!cvContent) {
    return (
      <div className="bg-yellow-900/30 p-4 rounded-lg">
        <p className="text-yellow-400">No CV content found</p>
      </div>
    );
  }

  return (
    <div 
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: cvContent }}
    />
  );
}