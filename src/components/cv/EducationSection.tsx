import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Education } from '../../types/cv';

interface EducationSectionProps {
  education: Education[];
  onAdd: () => void;
  onUpdate: (index: number, education: Education) => void;
  onRemove: (index: number) => void;
}

export function EducationSection({ education, onAdd, onUpdate, onRemove }: EducationSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Education</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Education
        </button>
      </div>
      {education.map((edu, index) => (
        <div key={index} className="bg-black/20 p-4 rounded mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Institution Name"
              value={edu.institution_name}
              onChange={(e) => onUpdate(index, { ...edu, institution_name: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Degree"
              value={edu.degree}
              onChange={(e) => onUpdate(index, { ...edu, degree: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Major"
              value={edu.major}
              onChange={(e) => onUpdate(index, { ...edu, major: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Graduation Year"
              value={edu.graduation_year}
              onChange={(e) => onUpdate(index, { ...edu, graduation_year: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            onClick={() => onRemove(index)}
            className="flex items-center gap-2 px-3 py-1 bg-red-600/30 rounded hover:bg-red-600/50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Remove
          </button>
        </div>
      ))}
    </section>
  );
}