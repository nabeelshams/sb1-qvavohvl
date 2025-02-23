import React from 'react';
import { JobTypePreferences } from '../../types/jobSearch';

interface JobTypeSectionProps {
  preferences: JobTypePreferences;
  onPreferenceChange: (field: keyof JobTypePreferences, value: string) => void;
}

export function JobTypeSection({ preferences, onPreferenceChange }: JobTypeSectionProps) {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Preferred Job Type</h3>
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={preferences.fullTime === "fulltime"}
            onChange={(e) => onPreferenceChange('fullTime', e.target.checked ? "fulltime" : "")}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Full Time</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={preferences.partTime === "parttime"}
            onChange={(e) => onPreferenceChange('partTime', e.target.checked ? "parttime" : "")}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Part Time</span>
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={preferences.remote === "remote"}
            onChange={(e) => onPreferenceChange('remote', e.target.checked ? "remote" : "")}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Remote</span>
        </label>
      </div>
    </section>
  );
}