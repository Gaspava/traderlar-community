import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!query.trim()) {
      return NextResponse.json({ 
        results: [], 
        totalCount: 0,
        suggestions: [] 
      });
    }
    
    const supabase = await createClient();
    
    // Determine which types to search
    const searchTypes = type === 'all' 
      ? ['articles', 'users', 'topics', 'strategies']
      : [type];
      
    // Perform search
    const { data: results, error } = await supabase.rpc('search_all', {
      p_query: query,
      p_types: searchTypes,
      p_limit: limit,
      p_offset: offset
    });
    
    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
    
    // Get total count (for pagination)
    const totalCount = results?.length || 0;
    
    return NextResponse.json({
      results: results || [],
      totalCount,
      hasMore: totalCount === limit
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}