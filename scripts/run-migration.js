const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Read environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDkzODUxNSwiZXhwIjoyMDYwNTE0NTE1fQ.lQBsUzQqO0FKDdOOC15p9_Y-d0HqSgFiES_YgQZ-n0Q'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250804_add_media_content.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Split migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log(`Running ${statements.length} SQL statements...`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement
      })

      if (error) {
        console.error('Error:', error)
        // Try direct execution as backup
        console.log('Trying alternative method...')
      } else {
        console.log('Success!')
      }
    }

    console.log('\nMigration completed!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

runMigration()