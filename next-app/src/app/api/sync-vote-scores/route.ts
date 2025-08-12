import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    console.log('Starting vote score synchronization...');
    
    // Get all forum topics
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('id, vote_score, title');
    
    if (topicsError) {
      console.error('Error fetching topics:', topicsError);
      return NextResponse.json({ 
        success: false, 
        error: topicsError.message 
      }, { status: 500 });
    }
    
    let syncedCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const topic of topics || []) {
      try {
        // Calculate actual vote score from votes table
        const { data: votes, error: votesError } = await supabase
          .from('forum_topic_votes')
          .select('vote_type')
          .eq('topic_id', topic.id);
        
        if (votesError) {
          console.error(`Error fetching votes for topic ${topic.id}:`, votesError);
          errorCount++;
          continue;
        }
        
        const actualScore = votes?.reduce((sum, vote) => sum + vote.vote_type, 0) || 0;
        
        // Update topic if score differs
        if (topic.vote_score !== actualScore) {
          const { error: updateError } = await supabase
            .from('forum_topics')
            .update({ vote_score: actualScore })
            .eq('id', topic.id);
          
          if (updateError) {
            console.error(`Error updating topic ${topic.id}:`, updateError);
            errorCount++;
            continue;
          }
          
          syncedCount++;
          results.push({
            id: topic.id,
            title: topic.title,
            oldScore: topic.vote_score,
            newScore: actualScore,
            difference: actualScore - topic.vote_score
          });
          
          console.log(`Updated topic "${topic.title}" vote score: ${topic.vote_score} -> ${actualScore}`);
        }
      } catch (error) {
        console.error(`Error processing topic ${topic.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Vote score sync completed: ${syncedCount} updated, ${errorCount} errors`);
    
    return NextResponse.json({
      success: true,
      message: 'Vote score synchronization completed',
      totalTopics: topics?.length || 0,
      syncedCount,
      errorCount,
      results: results.slice(0, 20) // Return first 20 results to avoid response size issues
    });
    
  } catch (error) {
    console.error('Error in vote score sync:', error);
    return NextResponse.json({
      success: false,
      message: 'Error synchronizing vote scores',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}