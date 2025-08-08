// Script to create forum tables immediately
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local file manually
let envContent = '';
try {
  envContent = fs.readFileSync('.env.local', 'utf8');
} catch (error) {
  console.error('Could not read .env.local file');
  process.exit(1);
}

const envLines = envContent.split('\n');
envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key.trim()] = value.trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createForumTables() {
  console.log('Creating forum tables...\n');

  // Create forum_topics table
  const createTopicsTable = `
    CREATE TABLE IF NOT EXISTS public.forum_topics (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT,
      author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
      is_pinned BOOLEAN DEFAULT false NOT NULL,
      is_locked BOOLEAN DEFAULT false NOT NULL,
      view_count INTEGER DEFAULT 0 NOT NULL,
      reply_count INTEGER DEFAULT 0 NOT NULL,
      vote_score INTEGER DEFAULT 0 NOT NULL,
      last_reply_at TIMESTAMPTZ,
      last_reply_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createTopicsTable });
    if (error) {
      console.error('❌ Error creating forum_topics table:', error.message);
    } else {
      console.log('✅ Forum topics table created');
    }
  } catch (error) {
    console.error('❌ Error creating forum_topics table:', error.message);
  }

  // Create forum_posts table
  const createPostsTable = `
    CREATE TABLE IF NOT EXISTS public.forum_posts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
      author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      parent_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      is_edited BOOLEAN DEFAULT false NOT NULL,
      mentioned_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createPostsTable });
    if (error) {
      console.error('❌ Error creating forum_posts table:', error.message);
    } else {
      console.log('✅ Forum posts table created');
    }
  } catch (error) {
    console.error('❌ Error creating forum_posts table:', error.message);
  }

  // Create indexes
  const createIndexes = `
    CREATE INDEX IF NOT EXISTS idx_forum_topics_author_id ON public.forum_topics(author_id);
    CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON public.forum_topics(category_id);
    CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON public.forum_topics(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_forum_topics_last_reply_at ON public.forum_topics(last_reply_at DESC);
    CREATE INDEX IF NOT EXISTS idx_forum_topics_slug ON public.forum_topics(slug);
    CREATE INDEX IF NOT EXISTS idx_forum_posts_topic_id ON public.forum_posts(topic_id);
    CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON public.forum_posts(author_id);
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: createIndexes });
    if (error) {
      console.error('❌ Error creating indexes:', error.message);
    } else {
      console.log('✅ Indexes created');
    }
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }

  console.log('\nTesting tables...');
  
  // Test the tables
  try {
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('*')
      .limit(1);
    
    if (topicsError) {
      console.error('❌ Forum topics table test failed:', topicsError.message);
    } else {
      console.log('✅ Forum topics table is working');
    }
  } catch (error) {
    console.error('❌ Forum topics table test failed:', error.message);
  }
}

createForumTables().catch(console.error);