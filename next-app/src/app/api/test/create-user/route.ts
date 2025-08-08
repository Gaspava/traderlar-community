import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Check if user already exists in users table
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists', user: existingUser });
    }
    
    // Create user profile
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email!,
        name: user.email!.split('@')[0],
        username: user.email!.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        role: 'user'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error in create-user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}