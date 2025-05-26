-- Add public_key column to users table
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS public_key TEXT;

-- Create index on public_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_public_key ON auth.users(public_key);

-- Add comment to explain the column
COMMENT ON COLUMN auth.users.public_key IS 'RSA public key in PEM format for message encryption'; 