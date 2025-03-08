import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface KeywordsListProps {
  metadata: Record<string, any>;
  onKeywordClick?: (keyword: string) => void;
  isClickable?: boolean;
}

const formatKey = (key: string) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function KeywordsList({ metadata, onKeywordClick, isClickable = false }: KeywordsListProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['hard_skills', 'soft_skills']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const renderValue = (value: any) => {
    if (Array.isArray(value)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {value.map((item, index) => (
            <div 
              key={index}
              className={`bg-blue-900/20 px-3 py-1.5 rounded text-sm ${isClickable ? 'cursor-pointer hover:bg-blue-900/40 transition-colors' : ''}`}
              onClick={() => isClickable && onKeywordClick?.(item)}
              role={isClickable ? "button" : undefined}
              title={isClickable ? "Click to add to resume" : undefined}
            >
              {item}
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'string' && value) {
      return (
        <div 
          className={`bg-blue-900/20 px-3 py-1.5 rounded text-sm ${isClickable ? 'cursor-pointer hover:bg-blue-900/40 transition-colors' : ''}`}
          onClick={() => isClickable && onKeywordClick?.(value)}
          role={isClickable ? "button" : undefined}
          title={isClickable ? "Click to add to resume" : undefined}
        >
          {value}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Keywords & Requirements</h3>
      {Object.entries(metadata).map(([key, value]) => {
        // Skip empty arrays or empty strings
        if (
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'string' && !value)
        ) {
          return null;
        }

        const isExpanded = expandedSections.has(key);

        return (
          <div key={key} className="bg-black/20 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(key)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className="font-medium">{formatKey(key)}</span>
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 space-y-2">
                {renderValue(value)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}