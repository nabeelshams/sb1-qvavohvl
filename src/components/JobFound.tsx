import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Building2, MapPin, DollarSign, Globe, Star, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { MatchGauge } from './job/MatchGauge';
import { MatchDetails } from './job/MatchDetails';
import { JobMatchData, JobMatch } from '../types/jobMatch';
import { startJobSearch } from './jobSearch/services/jobSearchService';
import { uuidv4 } from '../utils/uuid';

interface Job {
  id: string;
  job_id: string;
  title: string;
  job_type: string;
  company_name: string;
  company_url: string;
  company_logo_url: string;
  rating_count: number;
  rating: number;
  country: string;
  state: string;
  city: string;
  description: string;
  date_published: string;
  salary_max: number;
  salary_min: number;
  salary_type: string;
  benefits: string;
  attributes: string[];
  occupation: string[];
  remote_work_model: string | null;
  created_at: string;
  job_url: string;
  job_match?: any;
}

export function JobFound() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [selectedJobMatch, setSelectedJobMatch] = useState<JobMatchData | null>(null);
  const [optimizing, setOptimizing] = useState<Set<string>>(new Set());

  const parseJobMatch = (jobMatch: any): JobMatchData | null => {
    if (!jobMatch) return null;
    
    try {
      // Handle different input types
      let rawMatch: JobMatch;
      
      if (typeof jobMatch === 'string') {
        // Remove code block markers if present
        const cleanJson = jobMatch.replace(/```json\n|\n```/g, '').trim();
        rawMatch = JSON.parse(cleanJson);
      } else if (typeof jobMatch === 'object') {
        rawMatch = jobMatch;
      } else {
        console.error('Invalid job match data type:', typeof jobMatch);
        return null;
      }
      
      // Validate the parsed data has the expected structure
      if (!rawMatch["Overall Match Score"]) {
        console.error('Missing Overall Match Score:', rawMatch);
        return null;
      }

      // Extract skills from rationale with better error handling
      const skillsRationale = rawMatch["Skills Match"]?.skills_rationale || '';
      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];
      
      // More robust skills parsing
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

      // Extract years with better error handling
      const expRationale = rawMatch["Experience Match"]?.experience_rationale || '';
      const yearsRequired = parseInt(expRationale.match(/requires (\d+)/)?.[1] || '0');
      const yearsMatched = parseInt(expRationale.match(/has (\d+)/)?.[1] || '0');

      // Construct the match data with safe fallbacks
      return {
        match_data: {
          overall_percentage: rawMatch["Overall Match Score"]?.overall_percentage ?? 0,
          skills_match: rawMatch["Skills Match"]?.skills_percentage ?? 0,
          experience_match: rawMatch["Experience Match"]?.experience_percentage ?? 0,
          education_match: rawMatch["Education Match"]?.education_percentage ?? 0,
          location_match: rawMatch["Location Match"]?.location_percentage ?? 0,
          salary_match: rawMatch["Salary Expectation Match"]?.salary_percentage ?? 0,
          job_type_match: 100 // Default value
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
  };

  const parseBenefits = (benefits: string | null): string[] => {
    if (!benefits) return [];
    return benefits.split(',').map(benefit => benefit.trim());
  };

  const handleOptimizeResume = async (job: Job) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      setOptimizing(prev => new Set(prev).add(job.job_id));

      // Generate a new UUID for this optimization request
      const optimizationId = uuidv4();

      // First, check if this ID already exists in the database
      const { data: existingOptimization } = await supabase
        .from('optimized_resumes')
        .select('id')
        .eq('id', optimizationId)
        .single();

      // If the ID already exists (very unlikely but possible), generate a new one
      if (existingOptimization) {
        throw new Error('UUID collision detected. Please try again.');
      }

      const payload = {
        id: optimizationId,
        user_id: user.id,
        job_id: job.job_id,
        job_title: job.title,
        job_description: job.description,
        company_name: job.company_name,
        benefits: Array.isArray(job.benefits) ? job.benefits.join(', ') : job.benefits || '',
        attributes: Array.isArray(job.attributes) ? job.attributes.join(', ') : '',
        occupation: Array.isArray(job.occupation) ? job.occupation.join(', ') : ''
      };

      const response = await fetch('https://hook.eu2.make.com/6jxv56p5mel55vjz161qehzgzhg1bjfi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize resume');
      }

      // Navigate to the resume optimization page
      navigate(`/resume-optimization/${user.id}/${job.job_id}/${optimizationId}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setOptimizing(prev => {
        const next = new Set(prev);
        next.delete(job.job_id);
        return next;
      });
    }
  };

  const toggleJobExpansion = (jobId: string) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    let subscription: any;

    const fetchJobs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
          return;
        }

        // Initial fetch of existing jobs
        const { data: initialJobs, error: initialError } = await supabase
          .from('jobs_found')
          .select('*')
          .eq('id', user.id)  // Using 'id' instead of 'uid'
          .order('created_at', { ascending: false });

        if (initialError) throw initialError;
        setJobs(initialJobs || []);

        // Set up real-time subscription
        subscription = supabase
          .channel('jobs_found_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'jobs_found',
              filter: `id=eq.${user.id}`  // Using 'id' instead of 'uid'
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setJobs(currentJobs => {
                  const newJob = payload.new as Job;
                  if (currentJobs.some(job => job.job_id === newJob.job_id)) {
                    return currentJobs;
                  }
                  const updatedJobs = [newJob, ...currentJobs];
                  return updatedJobs.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  );
                });
                toast.success('New job found!');
              } else if (payload.eventType === 'UPDATE') {
                setJobs(currentJobs => 
                  currentJobs.map(job => 
                    job.job_id === (payload.new as Job).job_id ? payload.new as Job : job
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                setJobs(currentJobs => 
                  currentJobs.filter(job => job.job_id !== (payload.old as Job).job_id)
                );
              }
            }
          )
          .subscribe();

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
        toast.error('Failed to fetch jobs');
      }
    };

    fetchJobs();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/30 backdrop-blur-sm p-8 rounded-lg shadow-xl ring-1 ring-red-500/20">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <h2 className="text-2xl font-bold text-blue-300">Finding Jobs</h2>
          <p className="text-gray-400">Please wait while we search for matching opportunities...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Building2 className="w-16 h-16 text-blue-500" />
          <h2 className="text-2xl font-bold text-blue-300">Searching for Jobs</h2>
          <p className="text-gray-400 max-w-md">
            We're actively searching for jobs matching your criteria. New opportunities will appear here as soon as they're found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Jobs Found ({jobs.length})</h1>
        <div className="space-y-6">
          {jobs.map((job) => {
            const jobMatch = parseJobMatch(job.job_match);
            
            return (
              <div
                key={job.job_id}
                className="bg-black/30 backdrop-blur-sm p-6 rounded-lg shadow-xl ring-1 ring-white/20 hover:ring-blue-500/30 transition-all"
              >
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
                  
                  {/* Match Gauge moved to the right side */}
                  <div className="flex-shrink-0">
                    <MatchGauge
                      percentage={jobMatch?.match_data.overall_percentage ?? null}
                      onClick={() => jobMatch && setSelectedJobMatch(jobMatch)}
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
                    className={`text-gray-300 ${expandedJobs.has(job.job_id) ? '' : 'line-clamp-3'}`}
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => toggleJobExpansion(job.job_id)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {expandedJobs.has(job.job_id) ? 'Collapse' : 'Expand'}
                  </button>
                  <button
                    onClick={() => handleOptimizeResume(job)}
                    disabled={optimizing.has(job.job_id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {optimizing.has(job.job_id) ? (
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
          })}
        </div>
      </div>

      {/* Match Details Modal */}
      {selectedJobMatch && (
        <MatchDetails
          matchData={selectedJobMatch}
          onClose={() => setSelectedJobMatch(null)}
        />
      )}
    </div>
  );
}