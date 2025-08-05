const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://tnglzpywvtafomngxsgc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test connection
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Connection error:', error)
    } else {
      console.log('Database connection successful!')
      console.log('Sample data:', data)
    }

    // Check if media_content column exists
    const { data: columnCheck, error: columnError } = await supabase
      .from('matches')
      .select('media_content')
      .limit(1)

    if (columnError && columnError.message.includes('column')) {
      console.log('\nMedia content column does not exist yet. Migration needed.')
    } else if (columnCheck) {
      console.log('\nMedia content column already exists!')
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

testConnection()