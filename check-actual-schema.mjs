import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  console.log('Checking actual database schema...\n');
  
  // Get a sample match to see actual column names
  const { data: sampleMatch, error } = await supabase
    .from('matches')
    .select('*')
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching sample match:', error);
    return;
  }
  
  console.log('Actual columns in matches table:');
  console.log(Object.keys(sampleMatch).join(', '));
  
  console.log('\nSample match data:');
  console.log(JSON.stringify(sampleMatch, null, 2));
  
  // Check a specific match to understand the structure
  const { data: match145 } = await supabase
    .from('matches')
    .select('*')
    .eq('match_number', 145)
    .single();
    
  if (match145) {
    console.log('\nMatch 145 (Boys Semi-Final 1):');
    console.log(JSON.stringify(match145, null, 2));
  }
}

checkSchema().catch(console.error);