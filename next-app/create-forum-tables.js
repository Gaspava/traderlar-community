const { createClient } = require('@supabase/supabase-js');

// Service role key needed for DDL operations
const supabaseUrl = 'https://mvidkmnjtqizkhafdvwf.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

const supabase = createClient(supabaseUrl, serviceKey);

async function createForumTables() {
  console.log('🚀 Creating forum tables...');
  
  try {
    // Create forum_topics table
    console.log('Creating forum_topics table...');
    const topicsSQL = `
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
    
    const { error: topicsError } = await supabase.rpc('exec_sql', { sql: topicsSQL });
    if (topicsError) {
      console.error('Topics table error:', topicsError);
    } else {
      console.log('✅ forum_topics table created');
    }

    // Enable RLS
    console.log('Enabling RLS...');
    const rlsSQL = `
      ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Forum topics are viewable by everyone" ON public.forum_topics
        FOR SELECT USING (true);
        
      CREATE POLICY IF NOT EXISTS "Authenticated users can create topics" ON public.forum_topics
        FOR INSERT WITH CHECK (auth.uid() = author_id);
    `;
    
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });
    if (rlsError) {
      console.error('RLS error:', rlsError);
    } else {
      console.log('✅ RLS policies created');
    }
    
    console.log('🎉 Forum setup completed!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Check if service key is provided
if (serviceKey === 'your-service-role-key-here') {
  console.log('❌ Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.log('You can find it in Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

createForumTables();