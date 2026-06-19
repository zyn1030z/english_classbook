-- Add theme_preference column to users table
-- Default: 'system' (follows OS preference)
-- Valid values: 'light', 'dark', 'system'
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system';
