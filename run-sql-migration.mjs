import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔧 Running SQL Migration...')

// Read SQL file
const sql = fs.readFileSync('./create-schools-table.sql', 'utf8')

// Split into individual statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0)

console.log(`Found ${statements.length} SQL statements to execute`)

// Execute each statement
for (let i = 0; i < statements.length; i++) {
  const statement = statements[i] + ';'
  console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)
  
  try {
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: statement
    })
    
    if (error) {
      console.log('❌ Error:', error.message)
      // Try alternative approach
      console.log('Trying alternative approach...')
      
      // For CREATE TABLE, we can't use direct RPC, but we can check if it worked
      if (statement.includes('CREATE TABLE')) {
        console.log('⚠️  Cannot create table via RPC. Please run SQL directly in Supabase dashboard.')
      }
    } else {
      console.log('✅ Success')
    }
  } catch (e) {
    console.log('⚠️  Statement needs to be run directly:', e.message)
  }
}

console.log('\n⚠️  Note: Some DDL statements (CREATE TABLE, ALTER TABLE) need to be run directly in the Supabase SQL editor.')
console.log('Please go to your Supabase dashboard and run the create-schools-table.sql file in the SQL editor.')