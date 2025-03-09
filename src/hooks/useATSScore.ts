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

    const parseATSScore = (rawScore: string | null): { score: number | null; data: ATSScoreData | null } => {
      if (!rawScore) {
        console.log('No raw score provided');
        return { score: null, data: null };
      }

      try {
        console.log('Raw ATS score:', rawScore);

        // First, try to parse as is (might already be a JSON object)
        if (typeof rawScore === 'object') {
          console.log('Score is already an object');
          const totalScore = rawScore["Total Score"]?.["Achieved Score"] ?? null;
          return {
            score: totalScore !== null ? parseFloat(totalScore.toString()) : null,
            data: rawScore as ATSScoreData
          };
        }

        // If it's a string, clean and parse it
        let cleanJson = rawScore
          .replace(/```json\n|\n```/g, '') // Remove code block markers
          .replace(/\\n/g, '') // Remove newline escape sequences
          .replace(/\\/g, '') // Remove remaining backslashes
          .trim();

        // If the string starts with a quote, it might be double-encoded
        if (cleanJson.startsWith('"')) {
          try {
            cleanJson = JSON.parse(cleanJson);
          } catch (e) {
            console.log('Failed to parse double-encoded JSON:', e);
          }
        }

        console.log('Cleaned JSON:', cleanJson);

        const scoreData = JSON.parse(cleanJson) as ATSScoreData;
        console.log('Parsed score data:', scoreData);
        
        const totalScore = scoreData?.["Total Score"]?.["Achieved Score"] ?? null;
        console.log('Extracted total score:', totalScore);

        if (totalScore === null) {
          console.log('Total score is null, full data:', scoreData);
        }

        return {
          score: totalScore !== null ? parseFloat(totalScore.toString()) : null,
          data: scoreData
        };
      } catch (error) {
        console.error('Error parsing ATS score:', error);
        console.error('Failed JSON:', rawScore);
        return { score: null, data: null };
      }
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
              console.log('Received update:', newData);
              
              if (newData.ats_score) {
                console.log('Processing new ATS score');
                const { score, data } = parseATSScore(newData.ats_score);
                
                if (score !== null) {
                  console.log('Setting new score:', score);
                  setATSScore(score);
                  setATSData(data);
                  setLoading(false);
                } else {
                  console.log('Failed to extract score from update');
                }
              } else {
                console.log('Update contained no ATS score');
              }
            }
          }
        )
        .subscribe();
    };

    const pollForScore = async () => {
      let retryCount = 0;
      const MAX_RETRIES = 30; // 30 seconds
      const POLL_INTERVAL = 1000; // 1 second

      const poll = async () => {
        if (!isSubscribed) return;

        try {
          console.log(`Polling attempt ${retryCount + 1}`);
          
          const { data, error } = await supabase
            .from('optimized_resumes')
            .select('ats_score')
            .eq('id', optimizationId)
            .single();

          if (error) {
            console.error('Polling error:', error);
            throw error;
          }

          console.log('Received data:', data);

          if (data?.ats_score) {
            console.log('Found ATS score, parsing...');
            const { score, data: parsedData } = parseATSScore(data.ats_score);
            
            if (score !== null) {
              console.log('Successfully parsed score:', score);
              setATSScore(score);
              setATSData(parsedData);
              setLoading(false);
              return;
            } else {
              console.log('Failed to parse score from data');
            }
          } else {
            console.log('No ATS score found in data');
          }

          retryCount++;
          if (retryCount < MAX_RETRIES && isSubscribed) {
            setTimeout(poll, POLL_INTERVAL);
          } else {
            console.log('Max retries reached');
            setLoading(false);
          }
        } catch (err: any) {
          console.error('Error in polling:', err);
          if (retryCount >= MAX_RETRIES) {
            setError(err.message);
            setLoading(false);
          } else if (isSubscribed) {
            setTimeout(poll, POLL_INTERVAL);
          }
        }
      };

      // Start polling immediately
      poll();
    };

    console.log('Setting up ATS score monitoring for:', optimizationId);
    setupRealtimeSubscription();
    pollForScore();

    return () => {
      console.log('Cleaning up ATS score monitoring');
      isSubscribed = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [optimizationId]);

  return { atsScore, atsData, loading, error };
}