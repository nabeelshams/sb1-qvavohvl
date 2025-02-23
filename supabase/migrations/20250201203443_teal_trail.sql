/*
  # Add storage policies for resume bucket

  1. Changes
    - Create resume bucket if it doesn't exist
    - Enable storage policies for resume bucket
    - Add policies for authenticated users to:
      - Upload their own files
      - Read their own files
*/

-- Create the resume bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('resume', 'resume')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket
UPDATE storage.buckets
SET public = false
WHERE id = 'resume';

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resume' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read their own files
CREATE POLICY "Authenticated users can read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resume' AND
  auth.uid()::text = (storage.foldername(name))[1]
);