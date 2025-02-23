import React from 'react';
import { X } from 'lucide-react';
import { JobMatchData } from '../../types/jobMatch';
import { MatchGauge } from './MatchGauge';

interface MatchDetailsProps {
  matchData: JobMatchData;
  onClose: () => void;
}

export function MatchDetails({ matchData, onClose }: MatchDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Match Details</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Overall Match */}
          <div className="flex flex-col items-center py-6">
            <MatchGauge 
              percentage={matchData.match_data.overall_percentage} 
              size="lg"
              label="Overall Match"
            />
            <p className="mt-4 text-sm text-gray-400 text-center max-w-lg">
              {matchData.rationale.overall}
            </p>
          </div>

          {/* Individual Match Categories */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <MatchGauge 
                percentage={matchData.match_data.skills_match}
                label="Skills"
              />
            </div>
            <div className="flex flex-col items-center">
              <MatchGauge 
                percentage={matchData.match_data.experience_match}
                label="Experience"
              />
            </div>
            <div className="flex flex-col items-center">
              <MatchGauge 
                percentage={matchData.match_data.education_match}
                label="Education"
              />
            </div>
            <div className="flex flex-col items-center">
              <MatchGauge 
                percentage={matchData.match_data.location_match}
                label="Location"
              />
            </div>
            <div className="flex flex-col items-center">
              <MatchGauge 
                percentage={matchData.match_data.salary_match}
                label="Salary"
              />
            </div>
            <div className="flex flex-col items-center">
              <MatchGauge 
                percentage={matchData.match_data.job_type_match}
                label="Job Type"
              />
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="space-y-6">
            {/* Skills Analysis */}
            <div className="space-y-3">
              <h4 className="font-medium">Skills Analysis</h4>
              <p className="text-sm text-gray-400">{matchData.rationale.skills}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm text-green-400 mb-2">Matched Skills</h5>
                  <div className="space-y-1">
                    {matchData.skills_details.matched.map((skill, index) => (
                      <div key={index} className="text-sm bg-green-900/30 px-2 py-1 rounded">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm text-red-400 mb-2">Missing Skills</h5>
                  <div className="space-y-1">
                    {matchData.skills_details.missing.map((skill, index) => (
                      <div key={index} className="text-sm bg-red-900/30 px-2 py-1 rounded">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Experience Analysis */}
            <div className="space-y-3">
              <h4 className="font-medium">Experience Analysis</h4>
              <p className="text-sm text-gray-400">{matchData.rationale.experience}</p>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Required Experience</span>
                  <span>{matchData.experience_details.years_required} years</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span>Your Experience</span>
                  <span>{matchData.experience_details.years_matched} years</span>
                </div>
              </div>
            </div>

            {/* Other Match Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">Education Match</h4>
                <p className="text-sm text-gray-400">{matchData.rationale.education}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Location Match</h4>
                <p className="text-sm text-gray-400">{matchData.rationale.location}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Salary Match</h4>
                <p className="text-sm text-gray-400">{matchData.rationale.salary}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}