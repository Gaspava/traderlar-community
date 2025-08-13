import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query.trim()) {
      return NextResponse.json({ suggestions: [] });
    }
    
    const supabase = await createClient();
    
    // Get search suggestions
    const { data: suggestions, error } = await supabase.rpc('get_search_suggestions', {
      p_query: query,
      p_limit: limit
    });
    
    if (error) {
      
      return NextResponse.json({ suggestions: [] });
    }
    
    return NextResponse.json({ 
      suggestions: suggestions || [] 
    });
  } catch (error) {
    
    return NextResponse.json({ suggestions: [] });
  }
}