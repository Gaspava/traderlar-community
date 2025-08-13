import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  // Auto-create user profile if authenticated user doesn't have one
  if (user && !request.nextUrl.pathname.startsWith('/auth/')) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!profile) {
        // Create missing user profile
        const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Kullanıcı';
        const username = user.user_metadata?.username || 
          user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 
          `user_${user.id.slice(0, 8)}`;
        
        await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            name: userName,
            username: username,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            role: 'user'
          });
      }
    } catch (error) {
      // Handle user profile creation error silently in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Error auto-creating user profile:', error);
      }
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/admin', '/profile', '/settings', '/articles/new']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Auth routes that should redirect if already logged in
  const authRoutes = ['/auth/login', '/auth/register']
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without auth (disabled for testing)
  // if (!user && isProtectedRoute) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/auth/login'
  //   url.searchParams.set('redirect', request.nextUrl.pathname)
  //   return NextResponse.redirect(url)
  // }

  // Redirect to home if accessing auth routes while logged in
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Check admin routes (disabled for testing)
  // if (request.nextUrl.pathname.startsWith('/admin') && user) {
  //   const { data: profile } = await supabase
  //     .from('users')
  //     .select('role')
  //     .eq('id', user.id)
  //     .single()

  //   if (!profile || profile.role !== 'admin') {
  //     const url = request.nextUrl.clone()
  //     url.pathname = '/'
  //     return NextResponse.redirect(url)
  //   }
  // }

  return supabaseResponse
}