import React from 'react';
import { X } from 'lucide-react';

interface JobTitlesSectionProps {
  jobTitles: string[];
  newJobTitle: string;
  onNewJobTitleChange: (value: string) => void;
  onAddJobTitle: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveJobTitle: (title: string) => void;
}

export function JobTitlesSection({
  jobTitles,
  newJobTitle,
  onNewJobTitleChange,
  onAddJobTitle,
  onRemoveJobTitle
}: JobTitlesSectionProps) {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-semibold mb-2">
        Job Titles to Search For <span className="text-red-400">*</span>
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        Chaakri will find out jobs for these jobs titles. Be sure to add relevant ones and remove irrelevant job titles
      </p>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Add a job title and press Enter"
          value={newJobTitle}
          onChange={(e) => onNewJobTitleChange(e.target.value)}
          onKeyDown={onAddJobTitle}
          className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {jobTitles.map((title, index) => (
            <span
              key={index}
              className="bg-blue-600/30 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {title}
              <button
                onClick={() => onRemoveJobTitle(title)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}