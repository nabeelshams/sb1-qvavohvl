import React from 'react';
import { Sparkles, AlertTriangle } from 'lucide-react';

interface SkillsAnalysisProps {
  requiredSkills: { [key: string]: number };
  userSkills: string[];
}

export function SkillsAnalysis({ requiredSkills, userSkills }: SkillsAnalysisProps) {
  // Sort skills by frequency (most demanded first)
  const sortedSkills = Object.entries(requiredSkills)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Show top 10 skills

  // Calculate missing skills (skills in high demand but not in user's profile)
  const missingSkills = sortedSkills
    .filter(([skill]) => !userSkills.some(
      userSkill => userSkill.toLowerCase() === skill.toLowerCase()
    ))
    .slice(0, 5); // Show top 5 missing skills

  return (
    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20">
      <h3 className="text-lg font-semibold mb-4">Skills Analysis</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most In-Demand Skills */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Most In-Demand Skills
          </h4>
          <div className="space-y-2">
            {sortedSkills.map(([skill, count]) => (
              <div key={skill} className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 rounded-full h-2"
                    style={{
                      width: `${(count / sortedSkills[0][1]) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm min-w-[120px] flex justify-between">
                  <span>{skill}</span>
                  <span className="text-gray-400">{count} jobs</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Skills */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Recommended Skills to Acquire
          </h4>
          <div className="space-y-3">
            {missingSkills.map(([skill, count]) => (
              <div
                key={skill}
                className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-yellow-400">{skill}</span>
                  <span className="text-sm text-yellow-400/60">
                    Required in {count} jobs
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Adding this skill could increase your job match rate
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}