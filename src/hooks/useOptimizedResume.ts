import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { OptimizedResume } from '../types/optimization';
import toast from 'react-hot-toast';

interface UseOptimizedResumeProps {
  userId: string;
  jobId: string;
  optimizationId: string;
}

export function useOptimizedResume({ userId, jobId, optimizationId }: UseOptimizedResumeProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResume | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 30; // 30 seconds max wait time
  const POLL_INTERVAL = 1000; // 1 second

  useEffect(() => {
    let isSubscribed = true;
    let subscription: any;
    let pollInterval: NodeJS.Timeout | null = null;

    const cleanup = () => {
      isSubscribed = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    const fetchOptimizedResume = async () => {
      if (!isSubscribed) return false;

      try {
        const { data, error } = await supabase
          .from('optimized_resumes')
          .select('*')
          .eq('user_id', userId)
          .eq('job_id', jobId)
          .eq('id', optimizationId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Record not found
            if (retryCount >= MAX_RETRIES) {
              throw new Error('Optimization request timed out. Please try again.');
            }
            return false;
          }
          throw error;
        }

        if (!data) {
          return false;
        }

        // Only check for optimized_resume field
        if (data.optimized_resume) {
          setOptimizedResume(data);
          setLoading(false);
          cleanup(); // Stop polling and subscription when we have valid data
          return true;
        }

        // If we have a record but not the optimized resume, keep polling
        if (retryCount >= MAX_RETRIES) {
          throw new Error('Optimization request timed out. Please try again.');
        }
        return false;
      } catch (err: any) {
        console.error('Error fetching optimized resume:', err);
        if (isSubscribed) {
          setError(err.message);
          setLoading(false);
          toast.error(err.message);
          cleanup(); // Stop polling and subscription on error
        }
        return true; // Stop polling on error
      }
    };

    const setupRealtimeSubscription = () => {
      subscription = supabase
        .channel(`optimized_resume_${optimizationId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'optimized_resumes',
            filter: `id=eq.${optimizationId}`
          },
          async (payload) => {
            if (!isSubscribed) return;

            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const newData = payload.new as OptimizedResume;
              
              // Only check for optimized_resume field
              if (
                newData.user_id === userId && 
                newData.job_id === jobId &&
                newData.id === optimizationId &&
                newData.optimized_resume
              ) {
                setOptimizedResume(newData);
                setLoading(false);
                cleanup(); // Stop polling and subscription when we have valid data
              }
            }
          }
        )
        .subscribe();
    };

    const startPolling = async () => {
      const found = await fetchOptimizedResume();
      
      if (!found && isSubscribed) {
        pollInterval = setInterval(async () => {
          if (!isSubscribed) return;
          
          setRetryCount(prev => prev + 1);
          const found = await fetchOptimizedResume();
          
          if (found) {
            cleanup(); // Stop polling and subscription when we have valid data
          }
        }, POLL_INTERVAL);
      }
    };

    setupRealtimeSubscription();
    startPolling();

    return cleanup;
  }, [userId, jobId, optimizationId, retryCount]);

  return { optimizedResume, loading, error };
}