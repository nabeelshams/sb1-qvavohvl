/*
  # Add job type preferences column

  1. Changes
    - Add `job_type_preferences` column to `cv_details` table
*/

-- Add job_type_preferences column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_details' AND column_name = 'job_type_preferences'
  ) THEN 
    ALTER TABLE cv_details ADD COLUMN job_type_preferences jsonb DEFAULT '{"fullTime": false, "partTime": false, "remote": false}'::jsonb;
  END IF;
END $$;