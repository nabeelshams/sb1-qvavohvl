import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ATSScoreData } from '../types/atsScore';

interface UseATSScoreProps {
  optimizationId: string;
}

interface ATSScoreResult {
  atsScore: number | null;
  atsData: ATSScoreData | null;
  loading: boolean;
  error: string | null;
}

export function useATSScore({ optimizationId }: UseATSScoreProps): ATSScoreResult {
  const [atsScore, setATSScore] = useState<number | null>(null);
  const [atsData, setATSData] = useState<ATSScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    let subscription: any;
    let pollTimeout: NodeJS.Timeout | null = null;

    const parseATSScore = (rawScore: any): { score: number | null; data: ATSScoreData | null } => {
      if (!rawScore) {
        return { score: null, data: null };
      }

      try {
        // If rawScore is already an object
        if (typeof rawScore === 'object' && !Array.isArray(rawScore)) {
          const totalScore = rawScore["Total Score"]?.["Achieved Score"];
          if (totalScore !== undefined && totalScore !== null) {
            return {
              score: parseFloat(totalScore.toString()),
              data: rawScore as ATSScoreData
            };
          }
        }

        // If rawScore is a string, parse it
        let scoreData: any;
        if (typeof rawScore === 'string') {
          // Remove code block markers and clean the string
          let cleanJson = rawScore
            .replace(/```json\n|\n```/g, '')
            .replace(/\\n/g, '')
            .trim();

          // Handle double-encoded JSON
          if (cleanJson.startsWith('"') && cleanJson.endsWith('"')) {
            cleanJson = JSON.parse(cleanJson);
          }

          scoreData = JSON.parse(cleanJson);
        }

        if (scoreData?.["Total Score"]?.["Achieved Score"] !== undefined) {
          return {
            score: parseFloat(scoreData["Total Score"]["Achieved Score"].toString()),
            data: scoreData as ATSScoreData
          };
        }

        return { score: null, data: null };
      } catch (error) {
        console.error('Error parsing ATS score:', error, 'Raw data:', rawScore);
        return { score: null, data: null };
      }
    };

    const fetchInitialData = async () => {
      try {
        const { data, error } = await supabase
          .from('optimized_resumes')
          .select('ats_score')
          .eq('id', optimizationId)
          .maybeSingle();

        if (error) throw error;

        if (data?.ats_score) {
          const { score, data: parsedData } = parseATSScore(data.ats_score);
          if (score !== null && parsedData !== null && isSubscribed) {
            setATSScore(score);
            setATSData(parsedData);
            setLoading(false);
            return true;
          }
        }
        return false;
      } catch (err) {
        console.error('Error fetching initial data:', err);
        return false;
      }
    };

    const pollForScore = async () => {
      let retryCount = 0;
      const MAX_RETRIES = 60; // 60 seconds
      const POLL_INTERVAL = 1000; // 1 second

      const poll = async () => {
        if (!isSubscribed) return;

        try {
          const { data, error } = await supabase
            .from('optimized_resumes')
            .select('ats_score')
            .eq('id', optimizationId)
            .maybeSingle();

          if (error) throw error;

          if (data?.ats_score) {
            const { score, data: parsedData } = parseATSScore(data.ats_score);
            if (score !== null && parsedData !== null && isSubscribed) {
              setATSScore(score);
              setATSData(parsedData);
              setLoading(false);
              return;
            }
          }

          retryCount++;
          if (retryCount < MAX_RETRIES && isSubscribed) {
            pollTimeout = setTimeout(poll, POLL_INTERVAL);
          } else {
            setLoading(false);
          }
        } catch (err: any) {
          console.error('Polling error:', err);
          if (retryCount >= MAX_RETRIES) {
            if (isSubscribed) {
              setError(err.message);
              setLoading(false);
            }
          } else if (isSubscribed) {
            pollTimeout = setTimeout(poll, POLL_INTERVAL);
          }
        }
      };

      await poll();
    };

    const setupRealtimeSubscription = () => {
      subscription = supabase
        .channel(`optimized_resume_${optimizationId}_ats`)
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

            if (payload.eventType === 'UPDATE') {
              const newData = payload.new as any;
              if (newData.ats_score) {
                const { score, data: parsedData } = parseATSScore(newData.ats_score);
                if (score !== null && parsedData !== null) {
                  setATSScore(score);
                  setATSData(parsedData);
                  setLoading(false);
                }
              }
            }
          }
        )
        .subscribe();
    };

    // Start the process
    const initialize = async () => {
      setLoading(true);
      setError(null);
      
      // Try to fetch initial data first
      const hasInitialData = await fetchInitialData();
      
      if (!hasInitialData) {
        // If no initial data, set up subscription and start polling
        setupRealtimeSubscription();
        pollForScore();
      }
    };

    initialize();

    return () => {
      isSubscribed = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
      if (pollTimeout) {
        clearTimeout(pollTimeout);
      }
    };
  }, [optimizationId]);

  return { atsScore, atsData, loading, error };
}