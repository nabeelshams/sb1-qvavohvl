import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Language } from '../../types/cv';

interface LanguagesSectionProps {
  languages: Language[];
  onAdd: () => void;
  onUpdate: (index: number, language: Language) => void;
  onRemove: (index: number) => void;
}

export function LanguagesSection({ languages, onAdd, onUpdate, onRemove }: LanguagesSectionProps) {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Languages</h3>
      {languages.map((lang, index) => (
        <div key={index} className="bg-black/20 p-4 rounded mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Language"
              value={lang.language}
              onChange={(e) => onUpdate(index, { ...lang, language: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
            <select
              value={lang.Proficiency}
              onChange={(e) => onUpdate(index, { ...lang, Proficiency: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none text-white"
            >
              <option value="" className="bg-gray-900">Select Proficiency</option>
              <option value="Native" className="bg-gray-900">Native</option>
              <option value="Fluent" className="bg-gray-900">Fluent</option>
              <option value="Advanced" className="bg-gray-900">Advanced</option>
              <option value="Intermediate" className="bg-gray-900">Intermediate</option>
              <option value="Basic" className="bg-gray-900">Basic</option>
            </select>
          </div>
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
        <Plus className="w-4 h-4" /> Add Language
      </button>
    </section>
  );
}