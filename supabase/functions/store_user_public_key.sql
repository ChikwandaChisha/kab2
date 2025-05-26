
-- Create function to safely store a user's public key
CREATE OR REPLACE FUNCTION public.store_user_public_key(
  p_user_id UUID,
  p_email TEXT,
  p_public_key TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_keys (user_id, email, public_key)
    VALUES (p_user_id, p_email, p_public_key)
    ON CONFLICT (email) 
    DO UPDATE SET public_key = p_public_key;
END;
$$;
