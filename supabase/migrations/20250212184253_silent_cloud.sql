/*
  # Create jobs_found table

  1. New Tables
    - `jobs_found`
      - Basic job info (title, type, company details)
      - Location info (country, state, city, etc.)
      - Job details (occupation, benefits, attributes)
      - Salary info
      - Metadata (source, URLs, dates)
  
  2. Security
    - Enable RLS on `jobs_found` table
    - Add policies for authenticated users to read jobs
*/

CREATE TABLE IF NOT EXISTS jobs_found (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  job_type text,
  company_name text,
  company_url text,
  company_logo_url text,
  rating_count integer,
  rating decimal(3,1),
  
  -- Location information
  country text,
  state text,
  city text,
  postal_code text,
  latitude decimal(10,6),
  longitude decimal(10,6),
  street_address text,
  
  -- Arrays for multiple values
  occupation text[],
  benefits text[],
  working_system text[],
  attributes text[],
  
  -- Job details
  num_of_candidates integer,
  description text,
  date_published timestamptz,
  expired boolean DEFAULT false,
  
  -- Salary information
  salary_max integer,
  salary_min integer,
  salary_type text,
  
  -- Source information
  source text,
  job_url text,
  scraped_from text,
  remote_work_model text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE jobs_found ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read jobs
CREATE POLICY "Authenticated users can read jobs"
  ON jobs_found
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for common search fields
CREATE INDEX IF NOT EXISTS jobs_found_country_idx ON jobs_found(country);
CREATE INDEX IF NOT EXISTS jobs_found_city_idx ON jobs_found(city);
CREATE INDEX IF NOT EXISTS jobs_found_date_published_idx ON jobs_found(date_published);
CREATE INDEX IF NOT EXISTS jobs_found_title_idx ON jobs_found USING gin(to_tsvector('english', title));

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_found_updated_at
  BEFORE UPDATE ON jobs_found
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();