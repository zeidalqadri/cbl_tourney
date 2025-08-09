-- Migration: Sync Girls Division Match Results
-- Date: 2025-08-06
-- Tournament: MSSN Melaka Basketball Championship 2025 - Girls Under 12

-- Set tournament ID
DO $$
DECLARE
    v_tournament_id UUID := '66666666-6666-6666-6666-666666666666';
BEGIN
    -- First, ensure all girls teams exist with correct groups
    -- Group PA Teams
    INSERT INTO tournament_teams (id, tournament_id, team_name, pool, division) VALUES
    (gen_random_uuid(), v_tournament_id, 'YU HWA', 'PA', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'KEH SENG', 'PA', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'PAY FONG 1', 'PA', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'SG UDANG', 'PA', 'girls')
    ON CONFLICT DO NOTHING;

    -- Group PB Teams (5 teams)
    INSERT INTO tournament_teams (id, tournament_id, team_name, pool, division) VALUES
    (gen_random_uuid(), v_tournament_id, 'PAY CHIAO', 'PB', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'YU HSIEN', 'PB', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'CHUNG HWA', 'PB', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'PING MING', 'PB', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'KUANG YAH', 'PB', 'girls')
    ON CONFLICT DO NOTHING;

    -- Group PC Teams
    INSERT INTO tournament_teams (id, tournament_id, team_name, pool, division) VALUES
    (gen_random_uuid(), v_tournament_id, 'BKT BERUANG', 'PC', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'YU YING', 'PC', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'PAY FONG 2', 'PC', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'NOTRE DAME', 'PC', 'girls')
    ON CONFLICT DO NOTHING;

    -- Group PD Teams
    INSERT INTO tournament_teams (id, tournament_id, team_name, pool, division) VALUES
    (gen_random_uuid(), v_tournament_id, 'CHABAU', 'PD', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'JASIN LALANG', 'PD', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'YING CHYE', 'PD', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'PONDOK BATANG', 'PD', 'girls')
    ON CONFLICT DO NOTHING;

    -- Group PE Teams
    INSERT INTO tournament_teams (id, tournament_id, team_name, pool, division) VALUES
    (gen_random_uuid(), v_tournament_id, 'KIOW MIN', 'PE', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'SIN WAH', 'PE', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'PAY TECK', 'PE', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'WEN HUA', 'PE', 'girls')
    ON CONFLICT DO NOTHING;

    -- Group PF Teams
    INSERT INTO tournament_teams (id, tournament_id, team_name, pool, division) VALUES
    (gen_random_uuid(), v_tournament_id, 'TIANG DUA', 'PF', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'PAY CHEE', 'PF', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'KUANG HWA', 'PF', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'CHENG', 'PF', 'girls')
    ON CONFLICT DO NOTHING;

    -- Group PG Teams (5 teams)
    INSERT INTO tournament_teams (id, tournament_id, team_name, pool, division) VALUES
    (gen_random_uuid(), v_tournament_id, 'MALIM', 'PG', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'ALOR GAJAH', 'PG', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'PAY HWA', 'PG', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'AYER KEROH', 'PG', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'POH LAN', 'PG', 'girls')
    ON CONFLICT DO NOTHING;

    -- Group PH Teams
    INSERT INTO tournament_teams (id, tournament_id, team_name, pool, division) VALUES
    (gen_random_uuid(), v_tournament_id, 'CHIAO CHEE', 'PH', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'MERLIMAU', 'PH', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'SHUH YEN', 'PH', 'girls'),
    (gen_random_uuid(), v_tournament_id, 'MASJID TANAH', 'PH', 'girls')
    ON CONFLICT DO NOTHING;

END $$;

-- Function to insert or update girls match with scores
CREATE OR REPLACE FUNCTION upsert_girls_match_result(
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
    -- Get team IDs for girls division
    SELECT id INTO v_team1_id FROM tournament_teams 
    WHERE tournament_id = p_tournament_id AND team_name = p_team1_name AND division = 'girls';
    
    SELECT id INTO v_team2_id FROM tournament_teams 
    WHERE tournament_id = p_tournament_id AND team_name = p_team2_name AND division = 'girls';
    
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
            jsonb_build_object('division', 'girls', 'type', 'group_stage')
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

-- Insert all girls division group stage matches
DO $$
DECLARE
    v_tournament_id UUID := '66666666-6666-6666-6666-666666666666';
BEGIN
    -- August 5, 2025 - SJKC YU HWA (Gelanggang A) - Girls matches
    PERFORM upsert_girls_match_result(v_tournament_id, 46, 'YU HWA', 'KEH SENG', 0, 16, '2025-08-05', '08:00', 'SJKC YU HWA A', 'PA');
    PERFORM upsert_girls_match_result(v_tournament_id, 48, 'PAY FONG 1', 'SG UDANG', 20, 0, '2025-08-05', '08:20', 'SJKC YU HWA A', 'PA');
    PERFORM upsert_girls_match_result(v_tournament_id, 50, 'PAY CHIAO', 'PING MING', 6, 0, '2025-08-05', '08:40', 'SJKC YU HWA A', 'PB');
    PERFORM upsert_girls_match_result(v_tournament_id, 52, 'YU HSIEN', 'CHUNG HWA', 4, 26, '2025-08-05', '09:00', 'SJKC YU HWA A', 'PB');
    PERFORM upsert_girls_match_result(v_tournament_id, 54, 'BKT BERUANG', 'YU YING', 22, 0, '2025-08-05', '09:20', 'SJKC YU HWA A', 'PC');
    PERFORM upsert_girls_match_result(v_tournament_id, 56, 'PAY FONG 2', 'NOTRE DAME', 16, 10, '2025-08-05', '09:40', 'SJKC YU HWA A', 'PC');
    PERFORM upsert_girls_match_result(v_tournament_id, 58, 'CHABAU', 'JASIN LALANG', 25, 2, '2025-08-05', '10:00', 'SJKC YU HWA A', 'PD');
    PERFORM upsert_girls_match_result(v_tournament_id, 60, 'YING CHYE', 'PONDOK BATANG', 6, 22, '2025-08-05', '10:20', 'SJKC YU HWA A', 'PD');
    PERFORM upsert_girls_match_result(v_tournament_id, 62, 'PING MING', 'KUANG YAH', 4, 22, '2025-08-05', '10:40', 'SJKC YU HWA A', 'PB');
    PERFORM upsert_girls_match_result(v_tournament_id, 64, 'CHUNG HWA', 'PAY CHIAO', 14, 8, '2025-08-05', '11:00', 'SJKC YU HWA A', 'PB');
    PERFORM upsert_girls_match_result(v_tournament_id, 66, 'YU HWA', 'PAY FONG 1', 13, 6, '2025-08-05', '11:20', 'SJKC YU HWA A', 'PA');
    PERFORM upsert_girls_match_result(v_tournament_id, 68, 'KEH SENG', 'SG UDANG', 20, 0, '2025-08-05', '11:40', 'SJKC YU HWA A', 'PA');
    PERFORM upsert_girls_match_result(v_tournament_id, 70, 'BKT BERUANG', 'PAY FONG 2', 6, 2, '2025-08-05', '12:00', 'SJKC YU HWA A', 'PC');
    PERFORM upsert_girls_match_result(v_tournament_id, 72, 'YU YING', 'NOTRE DAME', 2, 12, '2025-08-05', '12:20', 'SJKC YU HWA A', 'PC');
    PERFORM upsert_girls_match_result(v_tournament_id, 74, 'KUANG YAH', 'CHUNG HWA', 0, 11, '2025-08-05', '12:40', 'SJKC YU HWA A', 'PB');
    PERFORM upsert_girls_match_result(v_tournament_id, 76, 'PAY CHIAO', 'YU HSIEN', 25, 4, '2025-08-05', '13:00', 'SJKC YU HWA A', 'PB');
    PERFORM upsert_girls_match_result(v_tournament_id, 78, 'CHABAU', 'YING CHYE', 22, 6, '2025-08-05', '13:20', 'SJKC YU HWA A', 'PD');
    PERFORM upsert_girls_match_result(v_tournament_id, 80, 'JASIN LALANG', 'PONDOK BATANG', 4, 9, '2025-08-05', '13:40', 'SJKC YU HWA A', 'PD');
    PERFORM upsert_girls_match_result(v_tournament_id, 82, 'SG UDANG', 'YU HWA', 0, 20, '2025-08-05', '14:00', 'SJKC YU HWA A', 'PA');
    PERFORM upsert_girls_match_result(v_tournament_id, 84, 'PAY FONG 1', 'KEH SENG', 2, 17, '2025-08-05', '14:20', 'SJKC YU HWA A', 'PA');
    PERFORM upsert_girls_match_result(v_tournament_id, 86, 'YU HSIEN', 'KUANG YAH', 10, 22, '2025-08-05', '14:40', 'SJKC YU HWA A', 'PB');
    PERFORM upsert_girls_match_result(v_tournament_id, 88, 'CHUNG HWA', 'PING MING', 18, 2, '2025-08-05', '15:00', 'SJKC YU HWA A', 'PB');
    PERFORM upsert_girls_match_result(v_tournament_id, 90, 'NOTRE DAME', 'BKT BERUANG', 4, 10, '2025-08-05', '15:20', 'SJKC YU HWA A', 'PC');
    PERFORM upsert_girls_match_result(v_tournament_id, 92, 'PAY FONG 2', 'YU YING', 13, 0, '2025-08-05', '15:40', 'SJKC YU HWA A', 'PC');
    PERFORM upsert_girls_match_result(v_tournament_id, 94, 'PONDOK BATANG', 'CHABAU', 5, 22, '2025-08-05', '16:00', 'SJKC YU HWA A', 'PD');
    PERFORM upsert_girls_match_result(v_tournament_id, 96, 'YING CHYE', 'JASIN LALANG', 4, 12, '2025-08-05', '16:20', 'SJKC YU HWA A', 'PD');
    PERFORM upsert_girls_match_result(v_tournament_id, 98, 'PING MING', 'YU HSIEN', 0, 4, '2025-08-05', '16:40', 'SJKC YU HWA A', 'PB');
    PERFORM upsert_girls_match_result(v_tournament_id, 100, 'KUANG YAH', 'PAY CHIAO', 2, 8, '2025-08-05', '17:00', 'SJKC YU HWA A', 'PB');

    -- August 5, 2025 - SJKC MALIM (Gelanggang B) - Girls matches
    PERFORM upsert_girls_match_result(v_tournament_id, 47, 'PAY TECK', 'WEN HUA', 17, 2, '2025-08-05', '08:00', 'SJKC MALIM B', 'PE');
    PERFORM upsert_girls_match_result(v_tournament_id, 49, 'KIOW MIN', 'SIN WAH', 14, 6, '2025-08-05', '08:20', 'SJKC MALIM B', 'PE');
    PERFORM upsert_girls_match_result(v_tournament_id, 51, 'AYER KEROH', 'POH LAN', 6, 0, '2025-08-05', '08:40', 'SJKC MALIM B', 'PG');
    PERFORM upsert_girls_match_result(v_tournament_id, 53, 'PAY HWA', 'MALIM', 0, 9, '2025-08-05', '09:00', 'SJKC MALIM B', 'PG');
    PERFORM upsert_girls_match_result(v_tournament_id, 55, 'TIANG DUA', 'PAY CHEE', 0, 11, '2025-08-05', '09:20', 'SJKC MALIM B', 'PF');
    PERFORM upsert_girls_match_result(v_tournament_id, 57, 'KUANG HWA', 'CHENG', 0, 22, '2025-08-05', '09:40', 'SJKC MALIM B', 'PF');
    PERFORM upsert_girls_match_result(v_tournament_id, 59, 'CHIAO CHEE', 'MERLIMAU', 12, 2, '2025-08-05', '10:00', 'SJKC MALIM B', 'PH');
    PERFORM upsert_girls_match_result(v_tournament_id, 61, 'SHUH YEN', 'MASJID TANAH', 4, 5, '2025-08-05', '10:20', 'SJKC MALIM B', 'PH');
    PERFORM upsert_girls_match_result(v_tournament_id, 63, 'POH LAN', 'PAY HWA', 0, 2, '2025-08-05', '10:40', 'SJKC MALIM B', 'PG');
    PERFORM upsert_girls_match_result(v_tournament_id, 65, 'MALIM', 'ALOR GAJAH', 18, 5, '2025-08-05', '11:00', 'SJKC MALIM B', 'PG');
    PERFORM upsert_girls_match_result(v_tournament_id, 67, 'PAY TECK', 'KIOW MIN', 6, 8, '2025-08-05', '11:20', 'SJKC MALIM B', 'PE');
    PERFORM upsert_girls_match_result(v_tournament_id, 69, 'WEN HUA', 'SIN WAH', 0, 14, '2025-08-05', '11:40', 'SJKC MALIM B', 'PE');
    PERFORM upsert_girls_match_result(v_tournament_id, 71, 'TIANG DUA', 'KUANG HWA', 4, 0, '2025-08-05', '12:00', 'SJKC MALIM B', 'PF');
    PERFORM upsert_girls_match_result(v_tournament_id, 73, 'PAY CHEE', 'CHENG', 6, 4, '2025-08-05', '12:20', 'SJKC MALIM B', 'PF');
    PERFORM upsert_girls_match_result(v_tournament_id, 75, 'ALOR GAJAH', 'POH LAN', 0, 2, '2025-08-05', '12:40', 'SJKC MALIM B', 'PG');
    PERFORM upsert_girls_match_result(v_tournament_id, 77, 'PAY HWA', 'AYER KEROH', 5, 4, '2025-08-05', '13:00', 'SJKC MALIM B', 'PG');
    PERFORM upsert_girls_match_result(v_tournament_id, 79, 'CHIAO CHEE', 'SHUH YEN', 15, 0, '2025-08-05', '13:20', 'SJKC MALIM B', 'PH');
    PERFORM upsert_girls_match_result(v_tournament_id, 81, 'MERLIMAU', 'MASJID TANAH', 14, 2, '2025-08-05', '13:40', 'SJKC MALIM B', 'PH');
    PERFORM upsert_girls_match_result(v_tournament_id, 83, 'SIN WAH', 'PAY TECK', 11, 12, '2025-08-05', '14:00', 'SJKC MALIM B', 'PE');
    PERFORM upsert_girls_match_result(v_tournament_id, 85, 'KIOW MIN', 'WEN HUA', 23, 0, '2025-08-05', '14:20', 'SJKC MALIM B', 'PE');
    PERFORM upsert_girls_match_result(v_tournament_id, 87, 'AYER KEROH', 'ALOR GAJAH', 4, 2, '2025-08-05', '14:40', 'SJKC MALIM B', 'PG');
    PERFORM upsert_girls_match_result(v_tournament_id, 89, 'POH LAN', 'MALIM', 1, 14, '2025-08-05', '15:00', 'SJKC MALIM B', 'PG');
    PERFORM upsert_girls_match_result(v_tournament_id, 91, 'CHENG', 'TIANG DUA', 14, 0, '2025-08-05', '15:20', 'SJKC MALIM B', 'PF');
    PERFORM upsert_girls_match_result(v_tournament_id, 93, 'KUANG HWA', 'PAY CHEE', 2, 12, '2025-08-05', '15:40', 'SJKC MALIM B', 'PF');
    PERFORM upsert_girls_match_result(v_tournament_id, 95, 'MASJID TANAH', 'CHIAO CHEE', 2, 22, '2025-08-05', '16:00', 'SJKC MALIM B', 'PH');
    PERFORM upsert_girls_match_result(v_tournament_id, 97, 'SHUH YEN', 'MERLIMAU', 2, 6, '2025-08-05', '16:20', 'SJKC MALIM B', 'PH');
    PERFORM upsert_girls_match_result(v_tournament_id, 99, 'ALOR GAJAH', 'PAY HWA', 0, 6, '2025-08-05', '16:40', 'SJKC MALIM B', 'PG');
    PERFORM upsert_girls_match_result(v_tournament_id, 101, 'MALIM', 'AYER KEROH', 19, 8, '2025-08-05', '17:00', 'SJKC MALIM B', 'PG');

    -- Update group positions based on final standings
    -- Group winners (1st place teams that qualify for quarter-finals)
    UPDATE tournament_teams SET qualification_status = 'qualified', group_position = 1, current_stage = 'quarter_final'
    WHERE tournament_id = v_tournament_id AND division = 'girls' AND team_name IN (
        'KEH SENG',     -- PA winner
        'CHUNG HWA',    -- PB winner
        'BKT BERUANG',  -- PC winner
        'CHABAU',       -- PD winner
        'KIOW MIN',     -- PE winner
        'PAY CHEE',     -- PF winner
        'MALIM',        -- PG winner
        'CHIAO CHEE'    -- PH winner
    );

END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS upsert_girls_match_result;

-- Add comment for documentation
COMMENT ON COLUMN tournament_matches.group_code IS 'Group code for group stage matches (LA-LN for boys, PA-PH for girls)';