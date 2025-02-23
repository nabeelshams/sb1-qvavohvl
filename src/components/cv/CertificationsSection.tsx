import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Certification } from '../../types/cv';

interface CertificationsSectionProps {
  certifications: Certification[];
  onAdd: () => void;
  onUpdate: (index: number, certification: Certification) => void;
  onRemove: (index: number) => void;
}

export function CertificationsSection({ certifications, onAdd, onUpdate, onRemove }: CertificationsSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Certifications</h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Certification
        </button>
      </div>
      {certifications.map((cert, index) => (
        <div key={index} className="bg-black/20 p-4 rounded mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Certification Name"
              value={cert.certification}
              onChange={(e) => onUpdate(index, { ...cert, certification: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
            <input
              type="text"
              placeholder="Issuing Organization"
              value={cert.issuing_organization}
              onChange={(e) => onUpdate(index, { ...cert, issuing_organization: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
            <input
              type="date"
              placeholder="Issue Date"
              value={cert.issue_date}
              onChange={(e) => onUpdate(index, { ...cert, issue_date: e.target.value })}
              className="bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
            <input
              type="date"
              placeholder="Expiry Date"
              value={cert.expiry_date}
              onChange={(e) => onUpdate(index, { ...cert, expiry_date: e.target.value })}
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