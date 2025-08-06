-- Migration: Sync Boys Division Match Results
-- Date: 2025-08-06
-- Tournament: MSSN Melaka Basketball Championship 2025 - Boys Under 12

-- Set tournament ID
DO $$
DECLARE
    v_tournament_id UUID := '66666666-6666-6666-6666-666666666666';
    v_team_id UUID;
    v_team2_id UUID;
BEGIN
    -- First, ensure all teams exist with correct groups
    -- Group LA Teams
    INSERT INTO tournament_teams (id, tournament_id, team_name, pool, division) VALUES
    (gen_random_uuid(), v_tournament_id, 'MALIM', 'LA', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'TING HWA', 'LA', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'BERTAM ULU', 'LA', 'boys')
    ON CONFLICT DO NOTHING;

    -- Group LB Teams
    INSERT INTO tournament_teams (id, tournament_id, team_name, pool, division) VALUES
    (gen_random_uuid(), v_tournament_id, 'WEN HUA', 'LB', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'AYER KEROH', 'LB', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'SIANG LIN', 'LB', 'boys')
    ON CONFLICT DO NOTHING;

    -- Continue with all other groups...
    -- (Groups LC through LN)
    INSERT INTO tournament_teams (id, tournament_id, team_name, pool, division) VALUES
    -- Group LC
    (gen_random_uuid(), v_tournament_id, 'MASJID TANAH', 'LC', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'CHENG', 'LC', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'SHUH YEN', 'LC', 'boys'),
    -- Group LD
    (gen_random_uuid(), v_tournament_id, 'PAYA MENGKUANG', 'LD', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'POH LAN', 'LD', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'PONDOK BATANG', 'LD', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'CHABAU', 'LD', 'boys'),
    -- Group LE
    (gen_random_uuid(), v_tournament_id, 'PAY CHEE', 'LE', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'PING MING', 'LE', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'CHUNG HWA', 'LE', 'boys'),
    -- Group LF
    (gen_random_uuid(), v_tournament_id, 'SG UDANG', 'LF', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'MACHAP UMBOO', 'LF', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'ALOR GAJAH', 'LF', 'boys'),
    -- Group LG
    (gen_random_uuid(), v_tournament_id, 'PAY FONG 1', 'LG', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'KEH SENG', 'LG', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'MACHAP BARU', 'LG', 'boys'),
    -- Group LH
    (gen_random_uuid(), v_tournament_id, 'YU HWA', 'LH', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'YU YING', 'LH', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'TIANG DUA', 'LH', 'boys'),
    -- Group LI
    (gen_random_uuid(), v_tournament_id, 'MERLIMAU', 'LI', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'CHIAO CHEE', 'LI', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'JASIN LALANG', 'LI', 'boys'),
    -- Group LJ
    (gen_random_uuid(), v_tournament_id, 'LENDU', 'LJ', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'ST MARY', 'LJ', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'BACHANG', 'LJ', 'boys'),
    -- Group LK
    (gen_random_uuid(), v_tournament_id, 'PAY MIN', 'LK', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'PAY CHIAO', 'LK', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'SIN WAH', 'LK', 'boys'),
    -- Group LL
    (gen_random_uuid(), v_tournament_id, 'YU HSIEN', 'LL', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'PAY CHUIN', 'LL', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'KATHOLIK', 'LL', 'boys'),
    -- Group LM
    (gen_random_uuid(), v_tournament_id, 'KIOW MIN', 'LM', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'PAY TECK', 'LM', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'BKT BERUANG', 'LM', 'boys'),
    -- Group LN
    (gen_random_uuid(), v_tournament_id, 'PAY FONG 2', 'LN', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'PAY HWA', 'LN', 'boys'),
    (gen_random_uuid(), v_tournament_id, 'KUANG YAH', 'LN', 'boys')
    ON CONFLICT DO NOTHING;

END $$;

-- Function to insert or update match with scores
CREATE OR REPLACE FUNCTION upsert_match_result(
    p_tournament_id UUID,
    p_match_number INTEGER,
    p_team1_name TEXT,
    p_team2_name TEXT,
    p_score1 INTEGER,
    p_score2 INTEGER,
    p_match_date DATE,
    p_match_time TIME,
    p_venue TEXT,
    p_group_code TEXT,
    p_round INTEGER DEFAULT 1
) RETURNS VOID AS $$
DECLARE
    v_team1_id UUID;
    v_team2_id UUID;
    v_match_id UUID;
BEGIN
    -- Get team IDs
    SELECT id INTO v_team1_id FROM tournament_teams 
    WHERE tournament_id = p_tournament_id AND team_name = p_team1_name AND division = 'boys';
    
    SELECT id INTO v_team2_id FROM tournament_teams 
    WHERE tournament_id = p_tournament_id AND team_name = p_team2_name AND division = 'boys';
    
    -- Check if match exists
    SELECT id INTO v_match_id FROM tournament_matches
    WHERE tournament_id = p_tournament_id 
    AND match_number = p_match_number
    AND ((team1_id = v_team1_id AND team2_id = v_team2_id) OR (team1_id = v_team2_id AND team2_id = v_team1_id));
    
    IF v_match_id IS NULL THEN
        -- Insert new match
        INSERT INTO tournament_matches (
            id, tournament_id, match_number, team1_id, team2_id, 
            score1, score2, status, match_date, match_time, venue_court,
            group_code, round, scheduled_time, metadata
        ) VALUES (
            gen_random_uuid(), p_tournament_id, p_match_number, v_team1_id, v_team2_id,
            p_score1, p_score2, 'completed', p_match_date, p_match_time, p_venue,
            p_group_code, p_round, p_match_date + p_match_time, 
            jsonb_build_object('division', 'boys', 'type', 'group_stage')
        );
    ELSE
        -- Update existing match
        UPDATE tournament_matches
        SET score1 = p_score1,
            score2 = p_score2,
            status = 'completed',
            match_date = p_match_date,
            match_time = p_match_time,
            venue_court = p_venue,
            group_code = p_group_code
        WHERE id = v_match_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert all boys division group stage matches from August 4, 2025
DO $$
DECLARE
    v_tournament_id UUID := '66666666-6666-6666-6666-666666666666';
BEGIN
    -- August 4, 2025 - SJKC YU HWA (Gelanggang A)
    PERFORM upsert_match_result(v_tournament_id, 1, 'YU HWA', 'YU YING', 21, 9, '2025-08-04', '08:00', 'SJKC YU HWA A', 'LH');
    PERFORM upsert_match_result(v_tournament_id, 3, 'ST MARY', 'BACHANG', 2, 46, '2025-08-04', '08:20', 'SJKC YU HWA A', 'LJ');
    PERFORM upsert_match_result(v_tournament_id, 5, 'PAY MIN', 'SIN WAH', 4, 40, '2025-08-04', '08:40', 'SJKC YU HWA A', 'LK');
    PERFORM upsert_match_result(v_tournament_id, 7, 'MERLIMAU', 'CHIAO CHEE', 20, 2, '2025-08-04', '09:00', 'SJKC YU HWA A', 'LI');
    PERFORM upsert_match_result(v_tournament_id, 9, 'YU YING', 'TIANG DUA', 14, 2, '2025-08-04', '09:20', 'SJKC YU HWA A', 'LH');
    PERFORM upsert_match_result(v_tournament_id, 11, 'BACHANG', 'LENDU', 22, 0, '2025-08-04', '09:40', 'SJKC YU HWA A', 'LJ');
    PERFORM upsert_match_result(v_tournament_id, 13, 'SIN WAH', 'PAY CHIAO', 3, 48, '2025-08-04', '10:00', 'SJKC YU HWA A', 'LK');
    PERFORM upsert_match_result(v_tournament_id, 15, 'CHIAO CHEE', 'JASIN LALANG', 4, 3, '2025-08-04', '10:20', 'SJKC YU HWA A', 'LI');
    PERFORM upsert_match_result(v_tournament_id, 17, 'TIANG DUA', 'YU HWA', 0, 23, '2025-08-04', '10:40', 'SJKC YU HWA A', 'LH');
    PERFORM upsert_match_result(v_tournament_id, 19, 'LENDU', 'ST MARY', 7, 0, '2025-08-04', '11:00', 'SJKC YU HWA A', 'LJ');
    PERFORM upsert_match_result(v_tournament_id, 21, 'PAY CHIAO', 'PAY MIN', 19, 6, '2025-08-04', '11:20', 'SJKC YU HWA A', 'LK');
    PERFORM upsert_match_result(v_tournament_id, 23, 'JASIN LALANG', 'MERLIMAU', 4, 14, '2025-08-04', '11:40', 'SJKC YU HWA A', 'LI');
    PERFORM upsert_match_result(v_tournament_id, 25, 'YU HSIEN', 'PAY CHUIN', 38, 2, '2025-08-04', '12:00', 'SJKC YU HWA A', 'LL');
    PERFORM upsert_match_result(v_tournament_id, 27, 'KIOW MIN', 'PAY TECK', 7, 4, '2025-08-04', '12:20', 'SJKC YU HWA A', 'LM');
    PERFORM upsert_match_result(v_tournament_id, 29, 'PAY FONG 2', 'PAY HWA', 13, 5, '2025-08-04', '12:40', 'SJKC YU HWA A', 'LN');
    PERFORM upsert_match_result(v_tournament_id, 31, 'PAY CHUIN', 'KATHOLIK', 4, 28, '2025-08-04', '13:00', 'SJKC YU HWA A', 'LL');
    PERFORM upsert_match_result(v_tournament_id, 33, 'PAY TECK', 'BKT BERUANG', 4, 24, '2025-08-04', '13:20', 'SJKC YU HWA A', 'LM');
    PERFORM upsert_match_result(v_tournament_id, 35, 'PAY HWA', 'KUANG YAH', 20, 6, '2025-08-04', '13:40', 'SJKC YU HWA A', 'LN');
    PERFORM upsert_match_result(v_tournament_id, 37, 'KATHOLIK', 'YU HSIEN', 6, 20, '2025-08-04', '14:00', 'SJKC YU HWA A', 'LL');
    PERFORM upsert_match_result(v_tournament_id, 39, 'BKT BERUANG', 'KIOW MIN', 18, 7, '2025-08-04', '14:20', 'SJKC YU HWA A', 'LM');
    PERFORM upsert_match_result(v_tournament_id, 41, 'KUANG YAH', 'PAY FONG 2', 3, 28, '2025-08-04', '14:40', 'SJKC YU HWA A', 'LN');

    -- August 4, 2025 - SJKC MALIM (Gelanggang B)
    PERFORM upsert_match_result(v_tournament_id, 2, 'MALIM', 'TING HWA', 40, 2, '2025-08-04', '08:00', 'SJKC MALIM B', 'LA');
    PERFORM upsert_match_result(v_tournament_id, 4, 'WEN HUA', 'AYER KEROH', 12, 2, '2025-08-04', '08:20', 'SJKC MALIM B', 'LB');
    PERFORM upsert_match_result(v_tournament_id, 6, 'CHENG', 'SHUH YEN', 45, 2, '2025-08-04', '08:40', 'SJKC MALIM B', 'LC');
    PERFORM upsert_match_result(v_tournament_id, 8, 'TING HWA', 'BERTAM ULU', 2, 27, '2025-08-04', '09:00', 'SJKC MALIM B', 'LA');
    PERFORM upsert_match_result(v_tournament_id, 10, 'AYER KEROH', 'SIANG LIN', 30, 0, '2025-08-04', '09:20', 'SJKC MALIM B', 'LB');
    PERFORM upsert_match_result(v_tournament_id, 12, 'SHUH YEN', 'MASJID TANAH', 2, 19, '2025-08-04', '09:40', 'SJKC MALIM B', 'LC');
    PERFORM upsert_match_result(v_tournament_id, 14, 'BERTAM ULU', 'MALIM', 6, 15, '2025-08-04', '10:00', 'SJKC MALIM B', 'LA');
    PERFORM upsert_match_result(v_tournament_id, 16, 'SIANG LIN', 'WEN HUA', 0, 37, '2025-08-04', '10:20', 'SJKC MALIM B', 'LB');
    PERFORM upsert_match_result(v_tournament_id, 18, 'MASJID TANAH', 'CHENG', 2, 28, '2025-08-04', '10:40', 'SJKC MALIM B', 'LC');
    PERFORM upsert_match_result(v_tournament_id, 20, 'PAYA MENGKUANG', 'POH LAN', 4, 9, '2025-08-04', '11:00', 'SJKC MALIM B', 'LD');
    PERFORM upsert_match_result(v_tournament_id, 22, 'PONDOK BATANG', 'CHABAU', 3, 26, '2025-08-04', '11:20', 'SJKC MALIM B', 'LD');
    PERFORM upsert_match_result(v_tournament_id, 24, 'PAY CHEE', 'PING MING', 7, 4, '2025-08-04', '11:40', 'SJKC MALIM B', 'LE');
    PERFORM upsert_match_result(v_tournament_id, 26, 'SG UDANG', 'MACHAP UMBOO', 2, 10, '2025-08-04', '12:00', 'SJKC MALIM B', 'LF');
    PERFORM upsert_match_result(v_tournament_id, 28, 'PAY FONG 1', 'KEH SENG', 21, 0, '2025-08-04', '12:20', 'SJKC MALIM B', 'LG');
    PERFORM upsert_match_result(v_tournament_id, 30, 'PAYA MENGKUANG', 'PONDOK BATANG', 10, 14, '2025-08-04', '12:40', 'SJKC MALIM B', 'LD');
    PERFORM upsert_match_result(v_tournament_id, 32, 'POH LAN', 'CHABAU', 2, 20, '2025-08-04', '13:00', 'SJKC MALIM B', 'LD');
    PERFORM upsert_match_result(v_tournament_id, 34, 'PING MING', 'CHUNG HWA', 0, 22, '2025-08-04', '13:20', 'SJKC MALIM B', 'LE');
    PERFORM upsert_match_result(v_tournament_id, 36, 'MACHAP UMBOO', 'ALOR GAJAH', 8, 19, '2025-08-04', '13:40', 'SJKC MALIM B', 'LF');
    PERFORM upsert_match_result(v_tournament_id, 38, 'KEH SENG', 'MACHAP BARU', 19, 8, '2025-08-04', '14:00', 'SJKC MALIM B', 'LG');
    PERFORM upsert_match_result(v_tournament_id, 40, 'CHABAU', 'PAYA MENGKUANG', 18, 2, '2025-08-04', '14:20', 'SJKC MALIM B', 'LD');
    PERFORM upsert_match_result(v_tournament_id, 42, 'PONDOK BATANG', 'POH LAN', 16, 18, '2025-08-04', '14:40', 'SJKC MALIM B', 'LD');
    PERFORM upsert_match_result(v_tournament_id, 43, 'CHUNG HWA', 'PAY CHEE', 8, 10, '2025-08-04', '15:20', 'SJKC MALIM B', 'LE');
    PERFORM upsert_match_result(v_tournament_id, 44, 'ALOR GAJAH', 'SG UDANG', 20, 2, '2025-08-04', '15:40', 'SJKC MALIM B', 'LF');
    PERFORM upsert_match_result(v_tournament_id, 45, 'MACHAP BARU', 'PAY FONG 1', 6, 38, '2025-08-04', '16:00', 'SJKC MALIM B', 'LG');

    -- Update group positions based on final standings
    -- Group winners (1st place teams that qualify)
    UPDATE tournament_teams SET qualification_status = 'qualified', group_position = 1, current_stage = 'second_round'
    WHERE tournament_id = v_tournament_id AND division = 'boys' AND team_name IN (
        'MALIM',      -- LA winner
        'WEN HUA',    -- LB winner
        'CHENG',      -- LC winner
        'CHABAU',     -- LD winner
        'PAY CHEE',   -- LE winner
        'ALOR GAJAH', -- LF winner
        'PAY FONG 1', -- LG winner
        'YU HWA',     -- LH winner
        'MERLIMAU',   -- LI winner
        'BACHANG',    -- LJ winner
        'PAY CHIAO',  -- LK winner
        'YU HSIEN',   -- LL winner
        'BKT BERUANG',-- LM winner
        'PAY FONG 2'  -- LN winner
    );

END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS upsert_match_result;

-- Add comment for documentation
COMMENT ON COLUMN tournament_matches.group_code IS 'Group code for group stage matches (LA-LN for boys)';