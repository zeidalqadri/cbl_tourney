#\!/bin/bash

# Set environment variables for Cloudflare Pages project
echo "Setting environment variables for cbltour project..."

npx wrangler pages secret put NEXT_PUBLIC_SUPABASE_URL --project-name=cbltour << INPUT
https://tnglzpywvtafomngxsgc.supabase.co
INPUT

npx wrangler pages secret put NEXT_PUBLIC_SUPABASE_ANON_KEY --project-name=cbltour << INPUT
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2x6cHl3dnRhZm9tbmd4c2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5Mzg1MTUsImV4cCI6MjA2MDUxNDUxNX0.8BMy-i9bwn8BXjUuHkH74G5e-9EKOuT4V1TFjddVNYs
INPUT

npx wrangler pages secret put NEXT_PUBLIC_YOUTUBE_API_KEY --project-name=cbltour << INPUT
AIzaSyCUH80Lcyvusqv1e_N_hzwrMDnp4dt_LJ0
INPUT

npx wrangler pages secret put NEXT_PUBLIC_YOUTUBE_CHANNEL_ID --project-name=cbltour << INPUT
OrganizerCBL
INPUT

echo "Environment variables set successfully\!"
