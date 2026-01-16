-- Create a secure RPC function to get email from username
-- This is required because the client cannot directly query auth.users for security reasons.

CREATE OR REPLACE FUNCTION get_email_for_username(username_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- Use security definer to allow access to auth.users
AS $$
DECLARE
  found_email TEXT;
BEGIN
  -- Validate input
  IF username_input IS NULL THEN
    RETURN NULL;
  END IF;

  -- Lowercase the input just in case
  username_input := lower(username_input);

  -- Perform the query joining public.profiles and auth.users
  SELECT u.email INTO found_email
  FROM auth.users u
  JOIN public.profiles p ON u.id = p.id
  WHERE lower(p.username) = username_input;

  RETURN found_email;
END;
$$;
