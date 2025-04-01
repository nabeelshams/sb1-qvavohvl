import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UseAutomationStatusProps {
  runId: string | null;
  onComplete?: (totalJobs: number) => void;
}

export function useAutomationStatus({ runId, onComplete }: UseAutomationStatusProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'running' | 'completed' | 'failed' | null>(null);
  const [totalJobs, setTotalJobs] = useState<number>(0);

  useEffect(() => {
    let isSubscribed = true;
    let subscription: any;
    let pollInterval: NodeJS.Timeout | null = null;
    const POLL_INTERVAL = 2000; // 2 seconds

    const fetchStatus = async () => {
      if (!runId || !isSubscribed) return;

      try {
        const { data, error } = await supabase
          .from('automation_status')
          .select('total_jobs')
          .eq('run_id', runId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          console.log('Automation status update:', data); // Debug log
          const currentTotalJobs = data.total_jobs || 0;
          setTotalJobs(currentTotalJobs);
          
          // Determine status based on total_jobs
          const newStatus = currentTotalJobs > 0 ? 'running' : 'completed';
          setStatus(newStatus);
          setLoading(false);

          if (newStatus === 'completed') {
            console.log('Automation completed with total jobs:', currentTotalJobs); // Debug log
            if (onComplete) {
              onComplete(currentTotalJobs);
            }

            // Stop polling and subscription
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
            if (subscription) {
              supabase.removeChannel(subscription);
              subscription = null;
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching automation status:', err); // Debug log
        if (isSubscribed) {
          setError(err.message);
          setLoading(false);
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

            const data = payload.new as any;
            console.log('Real-time automation status update:', data); // Debug log
            
            const currentTotalJobs = data.total_jobs || 0;
            setTotalJobs(currentTotalJobs);
            
            // Determine status based on total_jobs
            const newStatus = currentTotalJobs > 0 ? 'running' : 'completed';
            setStatus(newStatus);

            if (newStatus === 'completed') {
              console.log('Real-time completion with total jobs:', currentTotalJobs); // Debug log
              if (onComplete) {
                onComplete(currentTotalJobs);
              }

              // Stop polling and subscription
              if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
              }
              if (subscription) {
                supabase.removeChannel(subscription);
                subscription = null;
              }
            }
          }
        )
        .subscribe();
    };

    if (runId) {
      console.log('Starting automation status monitoring for run_id:', runId); // Debug log
      setupRealtimeSubscription();
      fetchStatus();
      pollInterval = setInterval(fetchStatus, POLL_INTERVAL);
    }

    return () => {
      console.log('Cleaning up automation status monitoring'); // Debug log
      isSubscribed = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [runId, onComplete]);

  return { status, totalJobs, loading, error };
}