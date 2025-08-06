#!/usr/bin/env node

// Main script to sync tournament data from PDF to Supabase
// Run this script to update all match results and standings

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function runMigration(filePath, description) {
  console.log(`\n📝 Running: ${description}...`)
  
  try {
    const sql = fs.readFileSync(filePath, 'utf8')
    
    // Split SQL into individual statements (basic split by semicolon)
    // Note: This is simplified - production code should use a proper SQL parser
    const statements = sql
      .split(/;\s*$/gm)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt + ';')
    
    let successCount = 0
    let errorCount = 0
    
    for (const statement of statements) {
      // Skip comments and empty statements
      if (statement.trim().startsWith('--') || statement.trim().length === 0) {
        continue
      }
      
      try {
        // Execute the statement
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        }).single()
        
        if (error) {
          console.error(`   ❌ Error in statement: ${error.message}`)
          errorCount++
        } else {
          successCount++
        }
      } catch (err) {
        // If exec_sql doesn't exist, try direct execution (for simple queries)
        console.warn(`   ⚠️  Could not execute statement directly, may need manual run`)
        errorCount++
      }
    }
    
    console.log(`   ✅ Completed: ${successCount} successful, ${errorCount} errors`)
    return errorCount === 0
    
  } catch (error) {
    console.error(`   ❌ Failed to read or execute migration: ${error.message}`)
    return false
  }
}

async function syncTournamentData() {
  console.log('🏀 MSSN Melaka Basketball Championship 2025 - Data Sync')
  console.log('=' .repeat(60))
  console.log('Starting tournament data synchronization from PDF results...')
  
  const migrations = [
    {
      file: 'supabase/migrations/01-update-schema.sql',
      description: 'Update database schema'
    },
    {
      file: 'supabase/migrations/02-sync-boys-matches.sql',
      description: 'Sync boys division matches (Groups LA-LN)'
    },
    {
      file: 'supabase/migrations/03-sync-girls-matches.sql',
      description: 'Sync girls division matches (Groups PA-PH)'
    },
    {
      file: 'supabase/migrations/04-calculate-standings.sql',
      description: 'Calculate group standings'
    },
    {
      file: 'supabase/migrations/05-create-knockout-brackets.sql',
      description: 'Create knockout brackets'
    }
  ]
  
  console.log(`\n📋 Migrations to run: ${migrations.length}`)
  
  let allSuccess = true
  
  for (const migration of migrations) {
    const filePath = path.join(__dirname, migration.file)
    
    if (!fs.existsSync(filePath)) {
      console.error(`   ❌ Migration file not found: ${migration.file}`)
      console.log(`\n⚠️  Please run the migrations manually using Supabase dashboard or CLI:`)
      console.log(`   supabase db push --db-url "${process.env.NEXT_PUBLIC_SUPABASE_URL}"`)
      allSuccess = false
      continue
    }
    
    const success = await runMigration(filePath, migration.description)
    if (!success) {
      allSuccess = false
    }
  }
  
  console.log('\n' + '=' .repeat(60))
  
  if (allSuccess) {
    console.log('✅ All migrations completed successfully!')
    console.log('\n📊 Next steps:')
    console.log('   1. Run validation: npm run validate-tournament')
    console.log('   2. Check the frontend: npm run dev')
    console.log('   3. Verify tournament brackets are displayed correctly')
  } else {
    console.log('⚠️  Some migrations failed or need manual execution')
    console.log('\n📋 Manual migration steps:')
    console.log('   1. Go to Supabase Dashboard > SQL Editor')
    console.log('   2. Run each migration file in order:')
    migrations.forEach(m => {
      console.log(`      - ${m.file}`)
    })
    console.log('   3. Run validation after manual migration')
  }
  
  // Alternative: Direct data insertion for critical updates
  console.log('\n🔄 Attempting direct data updates...')
  await directDataSync()
}

async function directDataSync() {
  console.log('   Updating match scores directly...')
  
  // Sample direct update for a few critical matches
  const sampleMatches = [
    { match_number: 1, score1: 21, score2: 9 },  // YU HWA vs YU YING
    { match_number: 2, score1: 40, score2: 2 },  // MALIM vs TING HWA
    { match_number: 102, score1: null, score2: null } // KEH SENG vs CHUNG HWA (Quarter-final)
  ]
  
  for (const match of sampleMatches) {
    const { error } = await supabase
      .from('tournament_matches')
      .update({
        score1: match.score1,
        score2: match.score2,
        status: match.score1 !== null ? 'completed' : 'scheduled'
      })
      .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
      .eq('match_number', match.match_number)
    
    if (error) {
      console.log(`   ❌ Failed to update match ${match.match_number}: ${error.message}`)
    } else {
      console.log(`   ✅ Updated match ${match.match_number}`)
    }
  }
  
  console.log('   Direct updates completed')
}

// Run the sync
syncTournamentData()
  .then(() => {
    console.log('\n🎉 Tournament data sync process completed!')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Fatal error during sync:', err)
    process.exit(1)
  })