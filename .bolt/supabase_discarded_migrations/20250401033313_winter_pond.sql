-- Create enum type for automation status
CREATE TYPE automation_status_type AS ENUM ('running', 'completed', 'failed');

-- Create automation_status table
CREATE TABLE IF NOT EXISTS automation_status (
  run_id uuid PRIMARY KEY,
  status automation_status_type DEFAULT 'running',
  total_jobs integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE automation_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read automation status"
  ON automation_status
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_automation_status_updated_at
  BEFORE UPDATE ON automation_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster status lookups
CREATE INDEX automation_status_status_idx ON automation_status(status);