/*
  # Create optimized resumes table

  1. New Tables
    - `optimized_resumes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `job_id` (text, to link with the job this resume was optimized for)
      - `original_resume` (text, the original resume content)
      - `optimized_resume` (text, the AI-optimized resume content)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)
      - `status` (text, to track optimization status: 'pending', 'completed', 'failed')
      - `metadata` (jsonb, for storing additional information like job title, company, etc.)

  2. Security
    - Enable RLS on `optimized_resumes` table
    - Add policies for authenticated users to:
      - Read their own optimized resumes
      - Insert new optimized resumes
*/

-- Create optimized_resumes table
CREATE TABLE IF NOT EXISTS optimized_resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  job_id text NOT NULL,
  original_resume text,
  optimized_resume text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Add a unique constraint to prevent duplicate optimizations for the same user and job
  UNIQUE(user_id, job_id)
);

-- Enable Row Level Security
ALTER TABLE optimized_resumes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own optimized resumes"
  ON optimized_resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own optimized resumes"
  ON optimized_resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX optimized_resumes_user_id_idx ON optimized_resumes(user_id);
CREATE INDEX optimized_resumes_job_id_idx ON optimized_resumes(job_id);
CREATE INDEX optimized_resumes_status_idx ON optimized_resumes(status);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_optimized_resumes_updated_at
  BEFORE UPDATE ON optimized_resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();