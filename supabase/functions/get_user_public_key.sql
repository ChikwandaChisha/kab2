
-- Create function to safely retrieve a user's public key by email
CREATE OR REPLACE FUNCTION public.get_user_public_key(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_public_key TEXT;
BEGIN
    SELECT public_key INTO v_public_key
    FROM public.user_keys
    WHERE email = p_email;
    
    RETURN v_public_key;
END;
$$;
