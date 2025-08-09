-- Get current schema information from the database

-- List all tables in public schema
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Get columns for tournament_teams table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'tournament_teams'
ORDER BY ordinal_position;

-- Get columns for tournament_matches table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'tournament_matches'
ORDER BY ordinal_position;

-- Check if tournament_progression table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tournament_progression'
) as progression_table_exists;

-- Count existing data
SELECT 
    'tournament_teams' as table_name,
    COUNT(*) as record_count
FROM tournament_teams
WHERE tournament_id = '66666666-6666-6666-6666-666666666666'
UNION ALL
SELECT 
    'tournament_matches' as table_name,
    COUNT(*) as record_count
FROM tournament_matches
WHERE tournament_id = '66666666-6666-6666-6666-666666666666';