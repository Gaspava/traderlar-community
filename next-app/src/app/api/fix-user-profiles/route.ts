import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Get the current authenticated user
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if this user has a profile in users table
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    
    let result = { found: true, created: false, updated: false };
    
    if (!existingProfile) {
      // Create the user profile
      const userName = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Kullanıcı';
      const username = currentUser.user_metadata?.username || 
        currentUser.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 
        `user_${currentUser.id.slice(0, 8)}`;
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: currentUser.id,
          email: currentUser.email!,
          name: userName,
          username: username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`,
          role: 'user'
        });
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return NextResponse.json({ 
          success: false, 
          error: insertError.message 
        }, { status: 500 });
      }
      
      result = { found: false, created: true, updated: false };
    } else {
      // Check if profile needs updating (missing fields)
      let needsUpdate = false;
      const updateData: any = {};
      
      if (!existingProfile.name) {
        updateData.name = currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Kullanıcı';
        needsUpdate = true;
      }
      
      if (!existingProfile.username) {
        updateData.username = currentUser.user_metadata?.username || 
          currentUser.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 
          `user_${currentUser.id.slice(0, 8)}`;
        needsUpdate = true;
      }
      
      if (!existingProfile.avatar_url) {
        updateData.avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', currentUser.id);
        
        if (updateError) {
          console.error('Error updating user profile:', updateError);
          return NextResponse.json({ 
            success: false, 
            error: updateError.message 
          }, { status: 500 });
        }
        
        result = { found: true, created: false, updated: true };
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'User profile check completed',
      result,
      user: {
        id: currentUser.id,
        email: currentUser.email
      }
    });
    
  } catch (error) {
    console.error('Error fixing user profile:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fixing user profile',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}