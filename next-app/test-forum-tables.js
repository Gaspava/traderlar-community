// Test script to check if forum tables exist
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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testForumTables() {
  console.log('Testing forum tables...\n');

  // Test categories table
  try {
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (categoriesError) {
      console.error('❌ Categories table error:', categoriesError.message);
    } else {
      console.log('✅ Categories table exists');
      console.log(`   Found ${categories.length} categories`);
      if (categories.length > 0) {
        console.log(`   Example: ${categories[0].name} (${categories[0].slug})`);
      }
    }
  } catch (error) {
    console.error('❌ Categories table error:', error.message);
  }

  console.log();

  // Test forum_topics table
  try {
    const { data: topics, error: topicsError } = await supabase
      .from('forum_topics')
      .select('*')
      .limit(5);
    
    if (topicsError) {
      console.error('❌ Forum topics table error:', topicsError.message);
    } else {
      console.log('✅ Forum topics table exists');
      console.log(`   Found ${topics.length} topics`);
    }
  } catch (error) {
    console.error('❌ Forum topics table error:', error.message);
  }

  console.log();

  // Test users table
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table exists');
      console.log(`   Found ${users.length} users`);
    }
  } catch (error) {
    console.error('❌ Users table error:', error.message);
  }

  console.log();

  // Test creating a topic (dry run)
  try {
    const { data: testUser } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();

    const { data: testCategory } = await supabase
      .from('categories')
      .select('id')
      .limit(1)
      .single();

    if (testUser && testCategory) {
      console.log('✅ Ready for topic creation');
      console.log(`   Test user ID: ${testUser.id}`);
      console.log(`   Test category ID: ${testCategory.id}`);
    } else {
      console.log('❌ Missing test user or category');
    }
  } catch (error) {
    console.error('❌ Test preparation error:', error.message);
  }
}

testForumTables().catch(console.error);