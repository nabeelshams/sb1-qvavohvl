import React from 'react';

interface JobTitlesSectionProps {
  jobTitle: string;
  onJobTitleChange: (value: string) => void;
}

export function JobTitlesSection({ jobTitle, onJobTitleChange }: JobTitlesSectionProps) {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-semibold mb-2">
        Job Title <span className="text-red-400">*</span>
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        Enter the job title you're looking for. Make it specific to get better matches.
      </p>
      <input
        type="text"
        placeholder="e.g. Senior Software Engineer"
        value={jobTitle}
        onChange={(e) => onJobTitleChange(e.target.value)}
        className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
      />
    </section>
  );
}