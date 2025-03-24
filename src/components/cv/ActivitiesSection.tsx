import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Activity } from '../../types/cv';

interface ActivitiesSectionProps {
  activities: Activity[];
  onAdd: () => void;
  onUpdate: (index: number, activity: Activity) => void;
  onRemove: (index: number) => void;
}

export function ActivitiesSection({ activities, onAdd, onUpdate, onRemove }: ActivitiesSectionProps) {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Activities & Achievements</h3>
      {activities.map((activity, index) => (
        <div key={index} className="bg-black/20 p-4 rounded mb-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Activity Title"
              value={activity.activity}
              onChange={(e) => onUpdate(index, { ...activity, activity: e.target.value })}
              className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
            />
            <textarea
              placeholder="Description"
              value={activity.description}
              onChange={(e) => onUpdate(index, { ...activity, description: e.target.value })}
              className="w-full bg-black/20 p-3 rounded border border-white/10 focus:border-blue-500 outline-none"
              rows={3}
            />
          </div>
          <button
            onClick={() => onRemove(index)}
            className="flex items-center gap-2 px-3 py-1 mt-4 bg-red-600/30 rounded hover:bg-red-600/50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Remove
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors mt-4"
      >
        <Plus className="w-4 h-4" /> Add Activity
      </button>
    </section>
  );
}