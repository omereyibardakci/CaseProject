-- Add password field to users table
ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';

-- Update existing users with a default password (you should change these in production)
UPDATE users SET password = 'password123' WHERE password = '';

-- Add unique constraint on email if not already present
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
