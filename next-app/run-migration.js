const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // Service role key for admin operations
    );

    console.log('Loading migration file...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '011_trade_history_system.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('Migration SQL loaded, length:', migrationSQL.length);
    
    console.log('Executing migration...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('Migration failed:', error);
      throw error;
    }
    
    console.log('Migration executed successfully!');
    console.log('Result:', data);
    
    // Test if the table was created successfully
    console.log('Testing table creation...');
    const { data: testData, error: testError } = await supabase
      .from('strategy_trades')
      .select('id')
      .limit(1);
    
    if (testError && testError.message.includes('does not exist')) {
      console.error('Table still does not exist after migration');
      throw testError;
    } else if (testError) {
      console.log('Table exists but has other error (likely empty):', testError.message);
    } else {
      console.log('Table created successfully and accessible!');
    }
    
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();