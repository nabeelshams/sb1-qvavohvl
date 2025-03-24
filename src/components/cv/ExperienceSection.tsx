import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Experience } from '../../types/cv';

interface ExperienceSectionProps {
  experiences: Experience[];
  onAdd: () => void;
  onUpdate: (index: number, experience: Experience) => void;
  onRemove: (index: number) => void;
}

export function ExperienceSection({ experiences, onAdd, onUpdate, onRemove }: ExperienceSectionProps) {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Experience</h3>
      {experiences.map((exp, index) => (
        <div key={index} className="bg-black/20 p-4 rounded mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Company Name"
              value={exp.company_name}
              onChange={(e) => onUpdate(index, { ...exp, company_name: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Job Title"
              value={exp.job_title}
              onChange={(e) => onUpdate(index, { ...exp, job_title: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
            <input
              type="date"
              placeholder="Start Date"
              value={exp.start_date}
              onChange={(e) => onUpdate(index, { ...exp, start_date: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none text-white [color-scheme:dark]"
            />
            <input
              type="text"
              placeholder="End Date (or Present)"
              value={exp.end_date}
              onChange={(e) => onUpdate(index, { ...exp, end_date: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
          </div>
          <textarea
            placeholder="Description"
            value={exp.description}
            onChange={(e) => onUpdate(index, { ...exp, description: e.target.value })}
            className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none mb-4"
            rows={3}
          />
          <button
            onClick={() => onRemove(index)}
            className="flex items-center gap-2 px-3 py-1 bg-red-600/30 rounded hover:bg-red-600/50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Remove
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors mt-4"
      >
        <Plus className="w-4 h-4" /> Add Experience
      </button>
    </section>
  );
}