import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { articleIds } = await request.json();
    
    if (!articleIds || !Array.isArray(articleIds)) {
      return NextResponse.json(
        { error: 'Article IDs array is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Test makalelerini sil
    const { error } = await supabase
      .from('articles')
      .delete()
      .in('id', articleIds);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete articles' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${articleIds.length} articles` 
    });

  } catch (error) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}