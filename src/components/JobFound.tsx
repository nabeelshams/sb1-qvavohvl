import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { JobList } from './jobs/JobList';
import { LoadingState } from './jobs/LoadingState';
import { EmptyState } from './jobs/EmptyState';
import { MatchDetails } from './job/MatchDetails';
import { JobMatchData } from '../types/jobMatch';
import { Job } from '../types/job';
import { useJobSearch } from '../hooks/useJobSearch';
import { useAutomationStatus } from '../hooks/useAutomationStatus';
import { uuidv4 } from '../utils/uuid';

type TabType = 'new' | 'previous';

export function JobFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authLoading, setAuthLoading] = useState(true);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [selectedJobMatch, setSelectedJobMatch] = useState<JobMatchData | null>(null);
  const [optimizing, setOptimizing] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>('previous');
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [hasFetchedPrevious, setHasFetchedPrevious] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showNoJobsModal, setShowNoJobsModal] = useState(false);

  useEffect(() => {
    const runId = location.state?.runId || new URLSearchParams(location.search).get('runId');
    console.log('Current run_id:', runId);
    setCurrentRunId(runId);
    setActiveTab(runId ? 'new' : 'previous');
  }, [location]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/');
          return;
        }
        setUserId(user.id);
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const { jobs, loading: jobsLoading, error: jobsError, isSearching } = useJobSearch({
    userId,
    activeTab,
    currentRunId,
    hasFetchedPrevious
  });

  const { status: automationStatus } = useAutomationStatus({
    runId: currentRunId,
    onComplete: (totalJobs) => {
      if (totalJobs === 0) {
        setShowNoJobsModal(true);
      }
    }
  });

  const handleOptimizeResume = async (job: Job) => {
    try {
      if (!userId) throw new Error('Not authenticated');

      setOptimizing(prev => new Set(prev).add(job.job_id));

      const optimizationId = uuidv4();

      const { data: existingOptimization } = await supabase
        .from('optimized_resumes')
        .select('id')
        .eq('id', optimizationId)
        .single();

      if (existingOptimization) {
        throw new Error('UUID collision detected. Please try again.');
      }

      const payload = {
        id: optimizationId,
        user_id: userId,
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

      navigate(`/resume-optimization/${userId}/${job.job_id}/${optimizationId}`);
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

  if (authLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-black text-white p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4 mb-8">
          {currentRunId && (
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'bg-black/20 text-gray-400 hover:bg-black/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                New Job Opportunities
                {isSearching && activeTab === 'new' && automationStatus !== 'completed' && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </div>
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('previous');
              if (!hasFetchedPrevious) {
                setHasFetchedPrevious(true);
              }
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'previous'
                ? 'bg-blue-600 text-white'
                : 'bg-black/20 text-gray-400 hover:bg-black/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Previous Job Opportunities
            </div>
          </button>
        </div>

        <h1 className="text-4xl font-bold mb-8">
          {activeTab === 'new' ? 'New Jobs Found' : 'Previous Jobs'} ({jobs.length})
        </h1>

        {jobsLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState 
            activeTab={activeTab} 
            isSearching={isSearching && automationStatus !== 'completed'} 
          />
        ) : (
          <JobList
            jobs={jobs}
            expandedJobs={expandedJobs}
            optimizing={optimizing}
            onToggleExpand={toggleJobExpansion}
            onOptimize={handleOptimizeResume}
            onMatchClick={(matchData) => setSelectedJobMatch(matchData)}
          />
        )}

        {selectedJobMatch && (
          <MatchDetails
            matchData={selectedJobMatch}
            onClose={() => setSelectedJobMatch(null)}
          />
        )}
      </div>
    </div>
  );
}