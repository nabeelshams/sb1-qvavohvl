/*
  # Add WhatsApp notification column

  1. Changes
    - Add `notify_whatsapp` column to `cv_details` table
    - Add `notification_preferences` column to `cv_details` table
*/

-- Add notify_whatsapp column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_details' AND column_name = 'notify_whatsapp'
  ) THEN 
    ALTER TABLE cv_details ADD COLUMN notify_whatsapp text;
  END IF;
END $$;

-- Add notification_preferences column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cv_details' AND column_name = 'notification_preferences'
  ) THEN 
    ALTER TABLE cv_details ADD COLUMN notification_preferences jsonb DEFAULT '{"email": true, "whatsapp": false}'::jsonb;
  END IF;
END $$;