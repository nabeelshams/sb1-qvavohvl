/*
  # Add run_id column to jobs_found table

  1. Changes
    - Add `run_id` column to `jobs_found` table
    - Create index for `run_id` column
*/

-- Add run_id column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'jobs_found' AND column_name = 'run_id'
  ) THEN 
    ALTER TABLE jobs_found ADD COLUMN run_id uuid;
  END IF;
END $$;

-- Create index for run_id
CREATE INDEX IF NOT EXISTS jobs_found_run_id_idx ON jobs_found(run_id);