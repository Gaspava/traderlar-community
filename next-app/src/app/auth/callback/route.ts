import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Check if user already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()
      
      // If user doesn't exist in users table, create profile
      if (!existingUser) {
        // Get user metadata from auth
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Kullanıcı'
        const username = user.user_metadata?.username || 
          user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 
          `user_${user.id.slice(0, 8)}`
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            name: userName,
            username: username,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            role: 'user'
          })
        
        if (insertError) {
          console.error('Error creating user profile:', insertError)
        }
      }
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (forwardedHost && !isLocalEnv) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}