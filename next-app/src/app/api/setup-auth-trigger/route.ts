import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // This SQL creates a trigger that automatically creates a user profile 
    // whenever a new user signs up through Supabase Auth
    const triggerSQL = `
-- Create the function that will be triggered
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, username, avatar_url, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email::text),
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      regexp_replace(split_part(NEW.email::text, '@', 1), '[^a-zA-Z0-9]', '', 'g')
    ),
    CONCAT('https://api.dicebear.com/7.x/avataaars/svg?seed=', NEW.id::text),
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    username = COALESCE(EXCLUDED.username, users.username),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  
-- Also create a function to fix existing users without profiles
CREATE OR REPLACE FUNCTION public.create_missing_user_profiles()
RETURNS void AS $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL
  LOOP
    INSERT INTO public.users (id, email, name, username, avatar_url, role, created_at, updated_at)
    VALUES (
      auth_user.id,
      auth_user.email,
      COALESCE(auth_user.raw_user_meta_data->>'name', auth_user.email::text),
      COALESCE(
        auth_user.raw_user_meta_data->>'username',
        regexp_replace(split_part(auth_user.email::text, '@', 1), '[^a-zA-Z0-9]', '', 'g')
      ),
      CONCAT('https://api.dicebear.com/7.x/avataaars/svg?seed=', auth_user.id::text),
      'user',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

    // Execute the SQL - Note: This requires SQL execution permissions
    // In production, this should be run directly in Supabase SQL Editor
    return NextResponse.json({
      success: true,
      message: 'Auth trigger setup completed',
      sql: triggerSQL,
      note: 'In production, execute this SQL directly in Supabase SQL Editor for security'
    });
    
  } catch (error) {
    console.error('Error setting up auth trigger:', error);
    return NextResponse.json({
      success: false,
      message: 'Error setting up auth trigger',
      error: error instanceof Error ? error.message : 'Unknown error',
      sql: `-- Please run this SQL manually in your Supabase SQL Editor:
      
-- Create the function that will be triggered
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, username, avatar_url, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email::text),
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      regexp_replace(split_part(NEW.email::text, '@', 1), '[^a-zA-Z0-9]', '', 'g')
    ),
    CONCAT('https://api.dicebear.com/7.x/avataaars/svg?seed=', NEW.id::text),
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    username = COALESCE(EXCLUDED.username, users.username),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  
-- Fix existing users
SELECT public.create_missing_user_profiles();`
    }, { status: 500 });
  }
}