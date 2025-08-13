import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateTitleSimilarity, generateSearchPatterns } from '@/lib/utils/titleSimilarity';

interface RelatedTopic {
  id: string;
  title: string;
  slug: string;
  reply_count: number;
  vote_score: number;
  created_at: string;
  similarity_score?: number;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  author: {
    id: string;
    name: string;
    username: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get current topic details
    const { data: currentTopic, error: topicError } = await supabase
      .from('forum_topics')
      .select(`
        id,
        title,
        category_id,
        category:categories!forum_topics_category_id_fkey(
          id,
          name,
          slug,
          color
        )
      `)
      .eq('id', id)
      .single();

    if (topicError || !currentTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Fetch topics from same category first
    const { data: categoryTopics, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        category:categories!forum_topics_category_id_fkey(
          id,
          name,
          slug,
          color
        ),
        author:users!forum_topics_author_id_fkey(
          id,
          name,
          username
        )
      `)
      .eq('category_id', currentTopic.category_id)
      .neq('id', id)
      .order('vote_score', { ascending: false })
      .order('reply_count', { ascending: false })
      .limit(10); // Get more to filter by similarity

    if (error) {
      
      return await getFallbackRelatedTopics(supabase, currentTopic, id);
    }

    // Process and calculate client-side similarity scores
    const processedTopics: RelatedTopic[] = (categoryTopics || [])
      .map((topic: any) => ({
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        reply_count: topic.reply_count || 0,
        vote_score: topic.vote_score || 0,
        created_at: topic.created_at,
        category: topic.category,
        author: topic.author
      }))
      .map((topic: RelatedTopic) => ({
        ...topic,
        similarity_score: calculateTitleSimilarity(currentTopic.title, topic.title)
      }))
      .sort((a, b) => (b.similarity_score || 0) - (a.similarity_score || 0))
      .slice(0, 3); // Final selection of top 3

    // If not enough similar topics in same category, get from other categories
    if (processedTopics.length < 3) {
      const additionalTopics = await getPopularTopicsFromOtherCategories(
        supabase, 
        currentTopic, 
        id, 
        3 - processedTopics.length
      );
      processedTopics.push(...additionalTopics);
    }

    return NextResponse.json({
      related_topics: processedTopics.map(topic => ({
        ...topic,
        time_ago: formatTimeAgo(topic.created_at)
      }))
    });

  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Fallback function for simple category-based query
async function getFallbackRelatedTopics(supabase: any, currentTopic: any, currentId: string) {
  const { data: topics, error } = await supabase
    .from('forum_topics')
    .select(`
      *,
      category:categories!forum_topics_category_id_fkey(
        id,
        name,
        slug,
        color
      ),
      author:users!forum_topics_author_id_fkey(
        id,
        name,
        username
      )
    `)
    .eq('category_id', currentTopic.category_id)
    .neq('id', currentId)
    .order('vote_score', { ascending: false })
    .order('reply_count', { ascending: false })
    .limit(3);

  if (error) {
    return NextResponse.json({ related_topics: [] });
  }

  const processedTopics = (topics || []).map((topic: any) => ({
    id: topic.id,
    title: topic.title,
    slug: topic.slug,
    reply_count: topic.reply_count || 0,
    vote_score: topic.vote_score || 0,
    created_at: topic.created_at,
    similarity_score: calculateTitleSimilarity(currentTopic.title, topic.title),
    category: topic.category,
    author: topic.author,
    time_ago: formatTimeAgo(topic.created_at)
  }));

  return NextResponse.json({ related_topics: processedTopics });
}

// Get popular topics from other categories as backup
async function getPopularTopicsFromOtherCategories(
  supabase: any, 
  currentTopic: any, 
  currentId: string, 
  count: number
): Promise<RelatedTopic[]> {
  const { data: topics, error } = await supabase
    .from('forum_topics')
    .select(`
      *,
      category:categories!forum_topics_category_id_fkey(
        id,
        name,
        slug,
        color
      ),
      author:users!forum_topics_author_id_fkey(
        id,
        name,
        username
      )
    `)
    .neq('category_id', currentTopic.category_id)
    .neq('id', currentId)
    .order('vote_score', { ascending: false })
    .order('reply_count', { ascending: false })
    .limit(count);

  if (error || !topics) return [];

  return topics.map((topic: any) => ({
    id: topic.id,
    title: topic.title,
    slug: topic.slug,
    reply_count: topic.reply_count || 0,
    vote_score: topic.vote_score || 0,
    created_at: topic.created_at,
    similarity_score: calculateTitleSimilarity(currentTopic.title, topic.title),
    category: topic.category,
    author: topic.author
  }));
}

// Helper function to format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Az önce';
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün önce`;
  if (diffInHours < 720) return `${Math.floor(diffInHours / 168)} hafta önce`;
  return date.toLocaleDateString('tr-TR');
}