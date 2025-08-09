import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDkzODUxNSwiZXhwIjoyMDYwNTE0NTE1fQ.Tk4IwZRAbxTNS4kBlMCHaxaSdIoE_JBWbnSmQ7VKjAQ'

async function runSQL(sqlFile) {
  const sql = fs.readFileSync(sqlFile, 'utf8')
  
  console.log(`Running ${sqlFile}...`)
  
  // Use fetch to directly call Supabase's SQL endpoint
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ sql })
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error('❌ SQL execution failed:', error)
    
    // Try executing via pg endpoint
    console.log('\nTrying alternative approach...')
    const pgResponse = await fetch(`${supabaseUrl}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: sql })
    })
    
    if (pgResponse.ok) {
      console.log('✅ SQL executed successfully via pg endpoint')
    } else {
      console.error('❌ Both approaches failed')
    }
  } else {
    console.log('✅ SQL executed successfully')
  }
}

const sqlFile = process.argv[2]
if (!sqlFile) {
  console.error('Please provide SQL file as argument')
  process.exit(1)
}

await runSQL(sqlFile)