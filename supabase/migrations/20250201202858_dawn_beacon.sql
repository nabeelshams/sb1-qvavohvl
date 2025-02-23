/*
  # Create CV Details Table
  
  1. New Table
    - `cv_details`
      - `uid` (uuid, references auth.users)
      - `cv_url` (text)
      - `full_name` (text)
      - `phone_number` (text)
      - `email` (text)
      - `address` (text)
      - `website_or_portfolio` (text)
      - `summary` (text)
      - `experience` (jsonb)
      - `education` (jsonb)
      - `skills` (text[])
      - `certifications` (jsonb)
      - `languages` (jsonb)
      - `activities` (text)
      - `reference_list` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `cv_details` table
    - Add policies for authenticated users to manage their own CV details
*/

CREATE TABLE IF NOT EXISTS cv_details (
  uid uuid PRIMARY KEY REFERENCES auth.users,
  cv_url text,
  full_name text,
  phone_number text,
  email text,
  address text,
  website_or_portfolio text,
  summary text,
  experience jsonb DEFAULT '[]'::jsonb,
  education jsonb DEFAULT '[]'::jsonb,
  skills text[] DEFAULT ARRAY[]::text[],
  certifications jsonb DEFAULT '[]'::jsonb,
  languages jsonb DEFAULT '[]'::jsonb,
  activities text,
  reference_list jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cv_details ENABLE ROW LEVEL SECURITY;

-- Policies for cv_details table
CREATE POLICY "Users can view own cv details"
  ON cv_details FOR SELECT
  TO authenticated
  USING (auth.uid() = uid);

CREATE POLICY "Users can insert own cv details"
  ON cv_details FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can update own cv details"
  ON cv_details FOR UPDATE
  TO authenticated
  USING (auth.uid() = uid);