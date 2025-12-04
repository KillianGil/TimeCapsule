-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, bio)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'username', 'user_' || SUBSTRING(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data ->> 'avatar_url', NULL),
    COALESCE(new.raw_user_meta_data ->> 'bio', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
