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
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header with close button */}
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

          {/* Match Categories Grid */}
          <div className="grid grid-cols-1 gap-6">
            {/* Skills Match */}
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <MatchGauge 
                    percentage={matchData.match_data.skills_match}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-blue-400">Skills Match</h4>
                  <p className="text-sm text-gray-400">{matchData.rationale.skills}</p>
                </div>
              </div>
            </div>

            {/* Experience Match */}
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <MatchGauge 
                    percentage={matchData.match_data.experience_match}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-blue-400">Experience Match</h4>
                  <p className="text-sm text-gray-400">{matchData.rationale.experience}</p>
                </div>
              </div>
            </div>

            {/* Education Match */}
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <MatchGauge 
                    percentage={matchData.match_data.education_match}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-blue-400">Education Match</h4>
                  <p className="text-sm text-gray-400">{matchData.rationale.education}</p>
                </div>
              </div>
            </div>

            {/* Location Match */}
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <MatchGauge 
                    percentage={matchData.match_data.location_match}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-blue-400">Location Match</h4>
                  <p className="text-sm text-gray-400">{matchData.rationale.location}</p>
                </div>
              </div>
            </div>

            {/* Salary Match */}
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <MatchGauge 
                    percentage={matchData.match_data.salary_match}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-blue-400">Salary Match</h4>
                  <p className="text-sm text-gray-400">{matchData.rationale.salary}</p>
                </div>
              </div>
            </div>

            {/* Job Type Match */}
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center">
                  <MatchGauge 
                    percentage={matchData.match_data.job_type_match}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-blue-400">Job Type Match</h4>
                  <p className="text-sm text-gray-400">
                    {/* Leave empty as there's no rationale for job type */}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}