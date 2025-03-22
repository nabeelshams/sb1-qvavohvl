import React from 'react';
import { JobCard } from './JobCard';
import { Job } from '../../types/job';
import { JobMatchData } from '../../types/jobMatch';

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

function parseJobMatch(jobMatch: any): JobMatchData | null {
  if (!jobMatch) return null;
  
  try {
    let rawMatch: any;
    
    if (typeof jobMatch === 'string') {
      const cleanJson = jobMatch.replace(/```json\n|\n```/g, '').trim();
      rawMatch = JSON.parse(cleanJson);
    } else if (typeof jobMatch === 'object' && !Array.isArray(jobMatch)) {
      rawMatch = jobMatch;
    } else {
      console.error('Invalid job match data type:', typeof jobMatch);
      return null;
    }
    
    if (!rawMatch["Overall Match Score"]) {
      console.error('Missing Overall Match Score:', rawMatch);
      return null;
    }

    const skillsRationale = rawMatch["Skills Match"]?.skills_rationale || '';
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    
    if (skillsRationale.toLowerCase().includes('matched skills:')) {
      const matched = skillsRationale
        .toLowerCase()
        .split('matched skills:')[1]
        .split(/[.;]/)[0]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      matchedSkills.push(...matched);
    }
    
    if (skillsRationale.toLowerCase().includes('missing skills:')) {
      const missing = skillsRationale
        .toLowerCase()
        .split('missing skills:')[1]
        .split(/[.;]/)[0]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      missingSkills.push(...missing);
    }

    const expRationale = rawMatch["Experience Match"]?.experience_rationale || '';
    const yearsRequired = parseInt(expRationale.match(/requires (\d+)/)?.[1] || '0');
    const yearsMatched = parseInt(expRationale.match(/has (\d+)/)?.[1] || '0');

    return {
      match_data: {
        overall_percentage: rawMatch["Overall Match Score"]?.overall_percentage ?? 0,
        skills_match: rawMatch["Skills Match"]?.skills_percentage ?? 0,
        experience_match: rawMatch["Experience Match"]?.experience_percentage ?? 0,
        education_match: rawMatch["Education Match"]?.education_percentage ?? 0,
        location_match: rawMatch["Location Match"]?.location_percentage ?? 0,
        salary_match: rawMatch["Salary Expectation Match"]?.salary_percentage ?? 0,
        job_type_match: 100
      },
      skills_details: {
        matched: matchedSkills,
        missing: missingSkills
      },
      experience_details: {
        years_required: yearsRequired,
        years_matched: yearsMatched
      },
      rationale: {
        overall: rawMatch["Overall Match Score"]?.overall_summary || 'No summary available',
        skills: rawMatch["Skills Match"]?.skills_rationale || 'No skills rationale available',
        experience: rawMatch["Experience Match"]?.experience_rationale || 'No experience rationale available',
        education: rawMatch["Education Match"]?.education_rationale || 'No education rationale available',
        location: rawMatch["Location Match"]?.location_rationale || 'No location rationale available',
        salary: rawMatch["Salary Expectation Match"]?.salary_rationale || 'No salary rationale available'
      }
    };
  } catch (error) {
    console.error('Error parsing job match:', error);
    return null;
  }
}