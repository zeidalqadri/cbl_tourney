import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDkzODUxNSwiZXhwIjoyMDYwNTE0NTE1fQ.Tk4IwZRAbxTNS4kBlMCHaxaSdIoE_JBWbnSmQ7VKjAQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration(sqlFile) {
  const sql = fs.readFileSync(sqlFile, 'utf8')
  
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'))
  
  console.log(`\nRunning ${sqlFile}...`)
  console.log(`Found ${statements.length} SQL statements to execute\n`)
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    if (!statement) continue
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement + ';'
      }).single()
      
      if (error) {
        // Try direct execution for DDL statements
        const { error: execError } = await supabase.from('_exec').select(statement + ';')
        if (execError) {
          console.error(`❌ Statement ${i + 1} failed:`, execError.message)
          console.error(`   SQL: ${statement.substring(0, 50)}...`)
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`)
      }
    } catch (err) {
      console.error(`❌ Statement ${i + 1} error:`, err.message)
    }
  }
}

// Get file from command line argument
const sqlFile = process.argv[2]
if (!sqlFile) {
  console.error('Please provide SQL file as argument')
  process.exit(1)
}

await runMigration(sqlFile)