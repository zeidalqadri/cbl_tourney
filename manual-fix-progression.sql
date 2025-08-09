-- Manual SQL to fix tournament progression
-- Run this in Supabase SQL Editor

-- First, let's check what quarter-finals are completed
SELECT 
    match_number,
    home_team_id,
    away_team_id,
    home_score,
    away_score,
    status,
    CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
        ELSE NULL
    END as winner_id
FROM matches
WHERE match_number IN (
    -- Boys QF
    137, 138, 139, 140, 141, 142, 143, 144,
    -- Girls QF
    237, 238, 239, 240, 241, 242, 243, 244
)
AND status = 'completed'
ORDER BY match_number;

-- Now update the semi-finals based on completed quarter-finals
-- This will populate any missing teams in the semi-finals

-- Boys Quarter-Finals winners to Semi-Finals
UPDATE matches SET home_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 137 AND status = 'completed'
) WHERE match_number = 145 AND home_team_id IS NULL;

UPDATE matches SET away_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 138 AND status = 'completed'
) WHERE match_number = 145 AND away_team_id IS NULL;

UPDATE matches SET home_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 139 AND status = 'completed'
) WHERE match_number = 146 AND home_team_id IS NULL;

UPDATE matches SET away_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 140 AND status = 'completed'
) WHERE match_number = 146 AND away_team_id IS NULL;

UPDATE matches SET home_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 141 AND status = 'completed'
) WHERE match_number = 147 AND home_team_id IS NULL;

UPDATE matches SET away_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 142 AND status = 'completed'
) WHERE match_number = 147 AND away_team_id IS NULL;

UPDATE matches SET home_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 143 AND status = 'completed'
) WHERE match_number = 148 AND home_team_id IS NULL;

UPDATE matches SET away_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 144 AND status = 'completed'
) WHERE match_number = 148 AND away_team_id IS NULL;

-- Girls Quarter-Finals winners to Semi-Finals
UPDATE matches SET home_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 237 AND status = 'completed'
) WHERE match_number = 245 AND home_team_id IS NULL;

UPDATE matches SET away_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 238 AND status = 'completed'
) WHERE match_number = 245 AND away_team_id IS NULL;

UPDATE matches SET home_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 239 AND status = 'completed'
) WHERE match_number = 246 AND home_team_id IS NULL;

UPDATE matches SET away_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 240 AND status = 'completed'
) WHERE match_number = 246 AND away_team_id IS NULL;

UPDATE matches SET home_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 241 AND status = 'completed'
) WHERE match_number = 247 AND home_team_id IS NULL;

UPDATE matches SET away_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 242 AND status = 'completed'
) WHERE match_number = 247 AND away_team_id IS NULL;

UPDATE matches SET home_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 243 AND status = 'completed'
) WHERE match_number = 248 AND home_team_id IS NULL;

UPDATE matches SET away_team_id = (
    SELECT CASE 
        WHEN home_score > away_score THEN home_team_id
        WHEN away_score > home_score THEN away_team_id
    END FROM matches WHERE match_number = 244 AND status = 'completed'
) WHERE match_number = 248 AND away_team_id IS NULL;

-- Check the results
SELECT 
    m.match_number,
    m.match_type,
    ht.name as home_team,
    at.name as away_team,
    m.status
FROM matches m
LEFT JOIN teams ht ON m.home_team_id = ht.id
LEFT JOIN teams at ON m.away_team_id = at.id
WHERE m.match_number IN (
    -- Boys SF and Finals
    145, 146, 147, 148, 149, 150,
    -- Girls SF and Finals
    245, 246, 247, 248, 249, 250
)
ORDER BY m.match_number;