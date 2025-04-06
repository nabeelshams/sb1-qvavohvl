// src/components/dashboard/DashboardStats.tsx
import React, { useState } from 'react';
import { Briefcase, Building2, FileCheck, Star } from 'lucide-react';
import { ProfileCompletion } from './ProfileCompletion';

interface DashboardStatsProps {
  totalJobs: number;
  optimizedResumes: number;
  averageAtsScore: number;
  profileCompletion: number;
  missingFields: string[];
}

export function DashboardStats({ 
  totalJobs, 
  optimizedResumes, 
  averageAtsScore,
  profileCompletion,
  missingFields
}: DashboardStatsProps) {
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Total Jobs</h3>
              <p className="text-2xl font-bold">{totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <FileCheck className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Optimized Resumes</h3>
              <p className="text-2xl font-bold">{optimizedResumes}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Star className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Average ATS Score</h3>
              <p className="text-2xl font-bold">{averageAtsScore.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCompletionModal(true)}
          className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20 hover:ring-blue-500/30 transition-all text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Building2 className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">CV Completion</h3>
              <p className="text-2xl font-bold">{profileCompletion.toFixed(0)}%</p>
            </div>
          </div>
        </button>
      </div>

      {/* CV Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <ProfileCompletion 
              percentage={profileCompletion} 
              missingFields={missingFields}
              onClose={() => setShowCompletionModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
