import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get popular searches
    const { data: popularSearches, error } = await supabase
      .from('popular_searches')
      .select('*')
      .order('search_count', { ascending: false })
      .limit(10);
      
    if (error) {
      console.error('Popular searches error:', error);
      return NextResponse.json({ searches: [] });
    }
    
    return NextResponse.json({ 
      searches: popularSearches || [] 
    });
  } catch (error) {
    console.error('Popular searches API error:', error);
    return NextResponse.json({ searches: [] });
  }
}