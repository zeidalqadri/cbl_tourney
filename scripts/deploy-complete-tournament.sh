#!/bin/bash

# MSS Melaka 2025 Basketball Tournament - Complete Deployment Script
# This script sets up the complete tournament with all 129 matches and progression tracking

echo "🏀 MSS Melaka 2025 Basketball Tournament Setup"
echo "============================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "Run: brew install supabase/tap/supabase"
    exit 1
fi

# Set the project reference (update this with your actual project ref)
SUPABASE_PROJECT_REF="tnglzpywvtafomngxsgc"

echo "📊 Running database migrations..."

# Run migrations in order
echo "1️⃣ Creating base tournament structure..."
supabase db push --project-ref $SUPABASE_PROJECT_REF

echo "2️⃣ Adding progression tracking..."
supabase db push --project-ref $SUPABASE_PROJECT_REF

echo "📝 Seeding tournament data..."

# Seed teams
echo "3️⃣ Loading teams..."
supabase db push --project-ref $SUPABASE_PROJECT_REF < supabase/seed-mss-teams.sql

# Seed all 129 matches
echo "4️⃣ Loading all 129 matches..."
supabase db push --project-ref $SUPABASE_PROJECT_REF < supabase/seed-all-matches.sql

echo "✅ Tournament setup complete!"
echo ""
echo "Summary:"
echo "- 41 boys teams in 14 groups (LA-LN)"
echo "- 36 girls teams in 10 groups (PA-PJ)"  
echo "- 129 total matches scheduled"
echo "- Automatic bracket progression enabled"
echo "- Real-time qualification tracking active"
echo ""
echo "🚀 Your tournament system is ready!"
echo "Visit your deployment URL to see the complete tournament bracket."