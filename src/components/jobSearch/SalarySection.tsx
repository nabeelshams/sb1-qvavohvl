import React from 'react';
import { SalaryRange } from '../../types/jobSearch';

interface SalarySectionProps {
  salaryRange: SalaryRange;
  onSalaryChange: (field: keyof SalaryRange, value: number) => void;
}

export function SalarySection({ salaryRange, onSalaryChange }: SalarySectionProps) {
  return (
    <section className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Salary Expectation</h3>
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-gray-400">
          <span>${salaryRange.min.toLocaleString()}</span>
          <span>${salaryRange.max.toLocaleString()}</span>
        </div>
        <div className="relative h-2 mt-4">
          {/* Track background */}
          <div className="absolute w-full h-full bg-gray-700 rounded-full" />
          
          {/* Selected range */}
          <div
            className="absolute h-full bg-blue-500 rounded-full"
            style={{
              left: `${(salaryRange.min / 200000) * 100}%`,
              right: `${100 - (salaryRange.max / 200000) * 100}%`
            }}
          />

          {/* Slider thumbs */}
          <input
            type="range"
            min="0"
            max="200000"
            step="1000"
            value={salaryRange.min}
            onChange={(e) => onSalaryChange('min', parseInt(e.target.value))}
            className="absolute w-full appearance-none bg-transparent pointer-events-none z-20"
            style={{
              height: '8px',
              WebkitAppearance: 'none'
            }}
          />
          <input
            type="range"
            min="0"
            max="200000"
            step="1000"
            value={salaryRange.max}
            onChange={(e) => onSalaryChange('max', parseInt(e.target.value))}
            className="absolute w-full appearance-none bg-transparent pointer-events-none z-20"
            style={{
              height: '8px',
              WebkitAppearance: 'none'
            }}
          />

          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              pointer-events: all;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background-color: #3b82f6;
              border: 2px solid white;
              -webkit-appearance: none;
              cursor: pointer;
              margin-top: -4px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              transition: transform 0.1s ease;
            }

            input[type="range"]::-webkit-slider-thumb:hover {
              transform: scale(1.1);
            }

            input[type="range"]::-webkit-slider-thumb:active {
              transform: scale(0.9);
            }

            input[type="range"]::-moz-range-thumb {
              pointer-events: all;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background-color: #3b82f6;
              border: 2px solid white;
              cursor: pointer;
              margin-top: -4px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              transition: transform 0.1s ease;
            }

            input[type="range"]::-moz-range-thumb:hover {
              transform: scale(1.1);
            }

            input[type="range"]::-moz-range-thumb:active {
              transform: scale(0.9);
            }
          `}</style>
        </div>

        {/* Display exact values */}
        <div className="flex justify-between mt-6 text-sm">
          <div className="bg-black/20 px-3 py-1.5 rounded">
            Min: ${salaryRange.min.toLocaleString()}
          </div>
          <div className="bg-black/20 px-3 py-1.5 rounded">
            Max: ${salaryRange.max.toLocaleString()}
          </div>
        </div>
      </div>
    </section>
  );
}