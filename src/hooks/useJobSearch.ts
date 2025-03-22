import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Job } from '../types/job';
import toast from 'react-hot-toast';

interface UseJobSearchProps {
  userId: string | null;
  activeTab: 'new' | 'previous';
  currentRunId: string | null;
  hasFetchedPrevious: boolean;
}

export function useJobSearch({ 
  userId, 
  activeTab, 
  currentRunId,
  hasFetchedPrevious 
}: UseJobSearchProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let subscription: any;
    let pollingInterval: NodeJS.Timeout | null = null;
    let isSubscribed = true;
    const POLL_INTERVAL = 2000; // 2 seconds

    const setupRealtimeSubscription = () => {
      if (!userId) return;

      // Create filter based on active tab and run_id
      let filter = `id=eq.${userId}`;
      if (activeTab === 'new' && currentRunId) {
        filter += `,run_id=eq.${currentRunId}`;
      } else if (currentRunId) {
        filter += `,or=(run_id.is.null,run_id.neq.${currentRunId})`;
      }

      console.log('Setting up subscription with filter:', filter);

      subscription = supabase
        .channel(`jobs_found_${activeTab}_${currentRunId || 'all'}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'jobs_found',
            filter: filter
          },
          async (payload) => {
            if (!isSubscribed) return;
            console.log('Received real-time update:', payload);

            if (payload.eventType === 'INSERT') {
              const newJob = payload.new as Job;
              
              const isNewJob = activeTab === 'new' && newJob.run_id === currentRunId;
              const isPreviousJob = activeTab === 'previous' && 
                (!newJob.run_id || newJob.run_id !== currentRunId);

              if (isNewJob || isPreviousJob) {
                setJobs(currentJobs => {
                  // Check if job already exists
                  if (currentJobs.some(job => job.job_id === newJob.job_id)) {
                    return currentJobs;
                  }
                  
                  // Add new job and sort by creation date
                  const updatedJobs = [newJob, ...currentJobs];
                  return updatedJobs.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  );
                });
                
                if (isSubscribed) {
                  setLoading(false);
                  setIsSearching(true);
                  toast.success('New job found!');
                }
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedJob = payload.new as Job;
              if (isSubscribed) {
                setJobs(currentJobs => 
                  currentJobs.map(job => 
                    job.job_id === updatedJob.job_id ? updatedJob : job
                  )
                );
              }
            }
          }
        )
        .subscribe();
    };

    const fetchJobs = async () => {
      if (!userId || !isSubscribed) return;

      try {
        console.log('Fetching jobs for tab:', activeTab);

        let query = supabase
          .from('jobs_found')
          .select('*')
          .eq('id', userId);

        // Add filters based on active tab
        if (activeTab === 'new' && currentRunId) {
          query = query.eq('run_id', currentRunId);
        } else if (activeTab === 'previous' && currentRunId) {
          query = query.or(`run_id.is.null,run_id.neq.${currentRunId}`);
        }

        const { data: fetchedJobs, error: jobsError } = await query
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;

        if (isSubscribed) {
          if (fetchedJobs && fetchedJobs.length > 0) {
            console.log(`Found ${fetchedJobs.length} jobs for ${activeTab} tab`);
            setJobs(fetchedJobs);
            setLoading(false);
          } else {
            setJobs([]);
            setLoading(false);
          }

          // Keep searching state active for new jobs tab
          if (activeTab === 'new' && currentRunId) {
            setIsSearching(true);
          }
        }
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        if (isSubscribed) {
          setError(err.message);
          setLoading(false);
          toast.error('Failed to fetch jobs');
        }
      }
    };

    // Initialize subscription and polling
    if (userId) {
      // Reset states when tab or runId changes
      setJobs([]);
      setLoading(true);
      setError(null);
      setIsSearching(false);
      
      if (
        (activeTab === 'new' && currentRunId) ||
        (activeTab === 'previous' && hasFetchedPrevious) ||
        !currentRunId
      ) {
        setupRealtimeSubscription();
        fetchJobs();

        // Start polling only for new jobs search
        if (activeTab === 'new' && currentRunId) {
          console.log('Starting polling for new jobs');
          pollingInterval = setInterval(fetchJobs, POLL_INTERVAL);
        }
      } else {
        setLoading(false);
      }
    }

    // Cleanup
    return () => {
      console.log('Cleaning up effect');
      isSubscribed = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [userId, activeTab, currentRunId, hasFetchedPrevious]);

  return { jobs, loading, error, isSearching };
}