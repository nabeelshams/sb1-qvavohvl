import React from 'react';
import { X } from 'lucide-react';

interface SkillsSectionProps {
  skills: string[];
  newSkill: string;
  onNewSkillChange: (value: string) => void;
  onAddSkill: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveSkill: (skill: string) => void;
}

export function SkillsSection({ skills, newSkill, onNewSkillChange, onAddSkill, onRemoveSkill }: SkillsSectionProps) {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Skills</h3>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Add a skill and press Enter"
          value={newSkill}
          onChange={(e) => onNewSkillChange(e.target.value)}
          onKeyDown={onAddSkill}
          className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
        />
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="bg-blue-600/30 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 group hover:bg-blue-600/40 transition-colors"
            >
              <span>{skill}</span>
              <button
                onClick={() => onRemoveSkill(skill)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 hover:text-red-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}