import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UseAutomationStatusProps {
  runId: string | null;
  onComplete?: (totalJobs: number) => void;
}

export function useAutomationStatus({ runId, onComplete }: UseAutomationStatusProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'completed' | null>(null);
  const [totalJobs, setTotalJobs] = useState<number>(0);

  useEffect(() => {
    let isSubscribed = true;
    let subscription: any;
    let pollInterval: NodeJS.Timeout | null = null;
    const POLL_INTERVAL = 2000; // 2 seconds

    const cleanup = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      if (subscription) {
        supabase.removeChannel(subscription);
        subscription = null;
      }
    };

    const handleCompletion = (jobCount: number) => {
      if (!isSubscribed) return;
      
      setStatus('completed');
      setLoading(false);
      setTotalJobs(jobCount);
      cleanup();
      
      if (onComplete) {
        onComplete(jobCount);
      }
    };

    const fetchStatus = async () => {
      if (!runId || !isSubscribed) return;

      try {
        // Check if automation status record exists
        const { data: automationData, error: automationError } = await supabase
          .from('automation_status')
          .select('*')
          .eq('run_id', runId)
          .single();

        if (automationError) {
          // If record not found, automation hasn't started yet
          if (automationError.code === 'PGRST116') {
            return;
          }
          throw automationError;
        }

        // If automation status record exists, get total jobs count
        if (automationData) {
          const { data: jobsData, error: jobsError } = await supabase
            .from('jobs_found')
            .select('job_id')
            .eq('run_id', runId);

          if (jobsError) throw jobsError;

          const currentTotalJobs = jobsData?.length || 0;
          handleCompletion(currentTotalJobs);
        }
      } catch (err: any) {
        console.error('Error fetching status:', err);
        if (isSubscribed) {
          setError(err.message);
          setLoading(false);
          cleanup();
        }
      }
    };

    const setupRealtimeSubscription = () => {
      subscription = supabase
        .channel(`automation_status_${runId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'automation_status',
            filter: `run_id=eq.${runId}`
          },
          async (payload) => {
            if (!isSubscribed) return;

            // When automation status record is created or updated
            if (payload.new) {
              // Get total jobs count
              const { data: jobsData } = await supabase
                .from('jobs_found')
                .select('job_id')
                .eq('run_id', runId);

              const currentTotalJobs = jobsData?.length || 0;
              handleCompletion(currentTotalJobs);
            }
          }
        )
        .subscribe();
    };

    if (runId) {
      console.log('Starting automation monitoring for run_id:', runId);
      setupRealtimeSubscription();
      fetchStatus();
      pollInterval = setInterval(fetchStatus, POLL_INTERVAL);
    }

    return () => {
      console.log('Cleaning up automation monitoring');
      isSubscribed = false;
      cleanup();
    };
  }, [runId, onComplete]);

  return { status, totalJobs, loading, error };
}