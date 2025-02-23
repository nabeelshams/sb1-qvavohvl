import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Reference } from '../../types/cv';

interface ReferencesSectionProps {
  references: Reference[];
  onAdd: () => void;
  onUpdate: (index: number, reference: Reference) => void;
  onRemove: (index: number) => void;
}

export function ReferencesSection({ references, onAdd, onUpdate, onRemove }: ReferencesSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">References</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Reference
        </button>
      </div>
      {references.map((ref, index) => (
        <div key={index} className="bg-black/20 p-4 rounded mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={ref.Name}
              onChange={(e) => onUpdate(index, { ...ref, Name: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Contact Information"
              value={ref.contact_info}
              onChange={(e) => onUpdate(index, { ...ref, contact_info: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Company or Affiliation"
              value={ref.company_or_affiliation}
              onChange={(e) => onUpdate(index, { ...ref, company_or_affiliation: e.target.value })}
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