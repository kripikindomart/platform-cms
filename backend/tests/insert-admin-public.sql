-- Delete existing admin if any
DELETE FROM public.users WHERE email = 'admin@platform.com';

-- Insert admin with correct password hash
INSERT INTO public.users (
  email, 
  name, 
  password_hash, 
  is_active, 
  is_verified, 
  created_at, 
  updated_at
) VALUES (
  'admin@platform.com', 
  'Super Admin', 
  '$2b$12$xpmUE7BuwcMzi0P8Gf3oaOvXx5MkJfnhhlNJuV6Qtx7EN7pFMLoJ.',
  true, 
  true, 
  NOW(), 
  NOW()
) RETURNING id, email;
