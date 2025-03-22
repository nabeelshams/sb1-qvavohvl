import React from 'react';
import { Building2, MapPin, DollarSign, Globe, Star, Wand2, Loader2 } from 'lucide-react';
import { MatchGauge } from '../job/MatchGauge';
import { Job } from '../../types/job';
import { parseJobMatch } from '../../utils/jobMatchUtils';

interface JobCardProps {
  job: Job;
  isExpanded: boolean;
  isOptimizing: boolean;
  onToggleExpand: () => void;
  onOptimize: () => void;
  onMatchClick: () => void;
}

export function JobCard({ 
  job, 
  isExpanded, 
  isOptimizing,
  onToggleExpand, 
  onOptimize,
  onMatchClick 
}: JobCardProps) {
  const parseBenefits = (benefits: string | null): string[] => {
    if (!benefits) return [];
    return benefits.split(',').map(benefit => benefit.trim());
  };

  // Parse job match data
  const jobMatch = job.job_match ? parseJobMatch(job.job_match) : null;
  const matchPercentage = jobMatch?.match_data.overall_percentage ?? null;

  return (
    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20 hover:ring-blue-500/30 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          {job.company_logo_url ? (
            <img
              src={job.company_logo_url}
              alt={`${job.company_name} logo`}
              className="w-16 h-16 rounded-lg object-cover bg-white"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-blue-900/30 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-blue-300">{job.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <a
                href={job.company_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                {job.company_name}
              </a>
              {job.rating && (
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  {job.rating} ({job.rating_count} reviews)
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <MatchGauge
            percentage={matchPercentage}
            onClick={jobMatch ? onMatchClick : undefined}
            label="Match Score"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-2 text-gray-300">
          <MapPin className="w-4 h-4 text-gray-400" />
          {[job.city, job.state, job.country].filter(Boolean).join(', ')}
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-gray-400">Job Type:</span>
          {job.job_type || 'Not specified'}
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <DollarSign className="w-4 h-4 text-gray-400" />
          {job.salary_min && job.salary_max ? (
            `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()} ${job.salary_type?.toLowerCase() || ''}`
          ) : (
            'Salary not specified'
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <span className="text-gray-400">Job Posted:</span>
          {new Date(job.date_published).toLocaleDateString()}
        </div>
      </div>

      {job.remote_work_model && (
        <div className="flex items-center gap-2 mt-4 text-green-400">
          <Globe className="w-4 h-4" />
          {job.remote_work_model}
        </div>
      )}

      {job.benefits && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Benefits</h3>
          <div className="flex flex-wrap gap-2">
            {parseBenefits(job.benefits).map((benefit, index) => (
              <span
                key={`${job.job_id}-${index}`}
                className="px-2 py-1 bg-blue-900/30 rounded-full text-xs text-blue-300"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
        <div 
          className={`text-gray-300 ${isExpanded ? '' : 'line-clamp-3'}`}
          dangerouslySetInnerHTML={{ __html: job.description }}
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onToggleExpand}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
        <button
          onClick={onOptimize}
          disabled={isOptimizing}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Optimize Resume
            </>
          )}
        </button>
        <a
          href={job.job_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          View Job
        </a>
      </div>
    </div>
  );
}