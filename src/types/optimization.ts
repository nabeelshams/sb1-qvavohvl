export interface OptimizedResume {
  id: string;
  user_id: string;
  job_id: string;
  original_resume: string;
  optimized_resume: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'completed' | 'failed';
  metadata: Record<string, any>;
}