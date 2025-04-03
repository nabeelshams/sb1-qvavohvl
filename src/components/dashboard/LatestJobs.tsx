import React from 'react';
import { Building2, ChevronRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MatchGauge } from '../job/MatchGauge';
import { parseJobMatch } from '../../utils/jobMatchUtils';

interface Job {
  job_id: string;
  title: string;
  company_name: string;
  company_logo_url: string;
  city: string;
  state: string;
  country: string;
  job_match?: any;
}

interface LatestJobsProps {
  jobs: Job[];
}

export function LatestJobs({ jobs }: LatestJobsProps) {
  const navigate = useNavigate();

  const getMatchPercentage = (job: Job): number | null => {
    if (!job.job_match) return null;
    const matchData = parseJobMatch(job.job_match);
    return matchData?.match_data.overall_percentage ?? null;
  };

  // Take only the 4 most recent jobs
  const latestJobs = jobs.slice(0, 4);

  return (
    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Latest Jobs</h3>
        <button
          onClick={() => navigate('/jobs-found')}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
        >
          View All <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {latestJobs.map((job) => (
          <div 
            key={job.job_id} 
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => navigate('/jobs-found')}
          >
            <div className="flex items-start gap-4">
              {job.company_logo_url ? (
                <img
                  src={job.company_logo_url}
                  alt={job.company_name}
                  className="w-12 h-12 rounded bg-white object-contain flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-blue-300 truncate">{job.title}</h4>
                    <p className="text-sm text-gray-400 truncate">{job.company_name}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <MatchGauge
                      percentage={getMatchPercentage(job)}
                      size="sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {[job.city, job.state, job.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}