import React from 'react';
import { JobCard } from './JobCard';
import { Job } from '../../types/job';
import { JobMatchData } from '../../types/jobMatch';
import { parseJobMatch } from '../../utils/jobMatchUtils';

interface JobListProps {
  jobs: Job[];
  expandedJobs: Set<string>;
  optimizing: Set<string>;
  onToggleExpand: (jobId: string) => void;
  onOptimize: (job: Job) => void;
  onMatchClick: (matchData: JobMatchData) => void;
}

export function JobList({
  jobs,
  expandedJobs,
  optimizing,
  onToggleExpand,
  onOptimize,
  onMatchClick
}: JobListProps) {
  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <JobCard
          key={job.job_id}
          job={job}
          isExpanded={expandedJobs.has(job.job_id)}
          isOptimizing={optimizing.has(job.job_id)}
          onToggleExpand={() => onToggleExpand(job.job_id)}
          onOptimize={() => onOptimize(job)}
          onMatchClick={() => {
            const jobMatch = job.job_match ? 
              parseJobMatch(job.job_match) : null;
            if (jobMatch) {
              onMatchClick(jobMatch);
            }
          }}
        />
      ))}
    </div>
  );
}