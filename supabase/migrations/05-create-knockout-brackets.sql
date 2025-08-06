-- Migration: Create Knockout Brackets
-- Date: 2025-08-06
-- Purpose: Setup knockout stage matches for qualified teams

DO $$
DECLARE
    v_tournament_id UUID := '66666666-6666-6666-6666-666666666666';
    v_match_number INTEGER := 102; -- Starting from 102 for knockout matches
BEGIN
    -- BOYS DIVISION: Second Round Groups (August 6, 2025)
    -- Note: These matches are placeholders - actual teams TBD based on second round results
    
    -- Group LXA matches (MALIM, WEN HUA, CHENG)
    INSERT INTO tournament_matches (
        id, tournament_id, match_number, round, match_date, match_time, venue_court,
        group_code, status, metadata
    ) VALUES
    (gen_random_uuid(), v_tournament_id, 103, 2, '2025-08-06', '08:20', 'SJKC YU HWA A',
     'LXA', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round', 
     'team1_placeholder', 'WEN HUA', 'team2_placeholder', 'CHENG')),
    (gen_random_uuid(), v_tournament_id, 110, 2, '2025-08-06', '10:40', 'SJKC YU HWA A',
     'LXA', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'CHENG', 'team2_placeholder', 'MALIM')),
    (gen_random_uuid(), v_tournament_id, 117, 2, '2025-08-06', '13:00', 'SJKC YU HWA A',
     'LXA', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'MALIM', 'team2_placeholder', 'WEN HUA'));

    -- Group LXB matches (CHABAU, PAY CHEE, ALOR GAJAH, PAY FONG 1)
    INSERT INTO tournament_matches (
        id, tournament_id, match_number, round, match_date, match_time, venue_court,
        group_code, status, metadata
    ) VALUES
    (gen_random_uuid(), v_tournament_id, 104, 2, '2025-08-06', '08:40', 'SJKC YU HWA A',
     'LXB', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'CHABAU', 'team2_placeholder', 'PAY CHEE')),
    (gen_random_uuid(), v_tournament_id, 105, 2, '2025-08-06', '09:00', 'SJKC YU HWA A',
     'LXB', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'ALOR GAJAH', 'team2_placeholder', 'PAY FONG 1')),
    (gen_random_uuid(), v_tournament_id, 111, 2, '2025-08-06', '11:00', 'SJKC YU HWA A',
     'LXB', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'CHABAU', 'team2_placeholder', 'ALOR GAJAH')),
    (gen_random_uuid(), v_tournament_id, 112, 2, '2025-08-06', '11:20', 'SJKC YU HWA A',
     'LXB', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'PAY CHEE', 'team2_placeholder', 'PAY FONG 1')),
    (gen_random_uuid(), v_tournament_id, 118, 2, '2025-08-06', '13:20', 'SJKC YU HWA A',
     'LXB', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'PAY FONG 1', 'team2_placeholder', 'CHABAU')),
    (gen_random_uuid(), v_tournament_id, 119, 2, '2025-08-06', '13:40', 'SJKC YU HWA A',
     'LXB', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'ALOR GAJAH', 'team2_placeholder', 'PAY CHEE'));

    -- Group LYA matches (YU HWA, MERLIMAU, BACHANG, PAY CHIAO)
    INSERT INTO tournament_matches (
        id, tournament_id, match_number, round, match_date, match_time, venue_court,
        group_code, status, metadata
    ) VALUES
    (gen_random_uuid(), v_tournament_id, 106, 2, '2025-08-06', '09:20', 'SJKC YU HWA A',
     'LYA', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'YU HWA', 'team2_placeholder', 'MERLIMAU')),
    (gen_random_uuid(), v_tournament_id, 107, 2, '2025-08-06', '09:40', 'SJKC YU HWA A',
     'LYA', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'BACHANG', 'team2_placeholder', 'PAY CHIAO')),
    (gen_random_uuid(), v_tournament_id, 113, 2, '2025-08-06', '11:40', 'SJKC YU HWA A',
     'LYA', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'YU HWA', 'team2_placeholder', 'BACHANG')),
    (gen_random_uuid(), v_tournament_id, 114, 2, '2025-08-06', '12:00', 'SJKC YU HWA A',
     'LYA', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'MERLIMAU', 'team2_placeholder', 'PAY CHIAO')),
    (gen_random_uuid(), v_tournament_id, 120, 2, '2025-08-06', '14:00', 'SJKC YU HWA A',
     'LYA', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'PAY CHIAO', 'team2_placeholder', 'YU HWA')),
    (gen_random_uuid(), v_tournament_id, 121, 2, '2025-08-06', '14:20', 'SJKC YU HWA A',
     'LYA', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'BACHANG', 'team2_placeholder', 'MERLIMAU'));

    -- Group LYB matches (YU HSIEN, BKT BERUANG, PAY FONG 2)
    INSERT INTO tournament_matches (
        id, tournament_id, match_number, round, match_date, match_time, venue_court,
        group_code, status, metadata
    ) VALUES
    (gen_random_uuid(), v_tournament_id, 108, 2, '2025-08-06', '10:00', 'SJKC YU HWA A',
     'LYB', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'BUKIT BERUANG', 'team2_placeholder', 'PAY FONG 2')),
    (gen_random_uuid(), v_tournament_id, 115, 2, '2025-08-06', '12:20', 'SJKC YU HWA A',
     'LYB', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'PAY FONG 2', 'team2_placeholder', 'YU HSIEN')),
    (gen_random_uuid(), v_tournament_id, 122, 2, '2025-08-06', '14:40', 'SJKC YU HWA A',
     'LYB', 'scheduled', jsonb_build_object('division', 'boys', 'type', 'second_round',
     'team1_placeholder', 'YU HSIEN', 'team2_placeholder', 'BUKIT BERUANG'));

    -- GIRLS DIVISION: Quarter Finals (August 6, 2025)
    INSERT INTO tournament_matches (
        id, tournament_id, match_number, round, match_date, match_time, venue_court,
        status, metadata
    ) VALUES
    -- PQF1: KEH SENG vs CHUNG HWA
    (gen_random_uuid(), v_tournament_id, 102, 2, '2025-08-06', '08:00', 'SJKC YU HWA A',
     'scheduled', jsonb_build_object('division', 'girls', 'type', 'quarter_final', 'match_code', 'PQF1',
     'team1_placeholder', 'KEH SENG', 'team2_placeholder', 'CHUNG HWA')),
    
    -- PQF2: BUKIT BERUANG vs CHABAU
    (gen_random_uuid(), v_tournament_id, 109, 2, '2025-08-06', '10:20', 'SJKC YU HWA A',
     'scheduled', jsonb_build_object('division', 'girls', 'type', 'quarter_final', 'match_code', 'PQF2',
     'team1_placeholder', 'BUKIT BERUANG', 'team2_placeholder', 'CHABAU')),
    
    -- PQF3: KIOW MIN vs PAY CHEE
    (gen_random_uuid(), v_tournament_id, 116, 2, '2025-08-06', '12:40', 'SJKC YU HWA A',
     'scheduled', jsonb_build_object('division', 'girls', 'type', 'quarter_final', 'match_code', 'PQF3',
     'team1_placeholder', 'KIOW MIN', 'team2_placeholder', 'PAY CHEE')),
    
    -- PQF4: MALIM vs CHIAO CHEE
    (gen_random_uuid(), v_tournament_id, 123, 2, '2025-08-06', '15:00', 'SJKC YU HWA A',
     'scheduled', jsonb_build_object('division', 'girls', 'type', 'quarter_final', 'match_code', 'PQF4',
     'team1_placeholder', 'MALIM', 'team2_placeholder', 'CHIAO CHEE'));

    -- BOYS DIVISION: Semi Finals placeholders (will be determined after second round)
    INSERT INTO tournament_matches (
        id, tournament_id, match_number, round, match_date, match_time, venue_court,
        status, metadata
    ) VALUES
    -- LSF1: Winner LXA vs Winner LXB
    (gen_random_uuid(), v_tournament_id, 201, 3, '2025-08-07', '09:00', 'SJKC YU HWA A',
     'scheduled', jsonb_build_object('division', 'boys', 'type', 'semi_final', 'match_code', 'LSF1',
     'team1_placeholder', 'Winner LXA', 'team2_placeholder', 'Winner LXB',
     'depends_on', ARRAY['LXA', 'LXB'])),
    
    -- LSF2: Winner LYA vs Winner LYB
    (gen_random_uuid(), v_tournament_id, 202, 3, '2025-08-07', '09:30', 'SJKC YU HWA A',
     'scheduled', jsonb_build_object('division', 'boys', 'type', 'semi_final', 'match_code', 'LSF2',
     'team1_placeholder', 'Winner LYA', 'team2_placeholder', 'Winner LYB',
     'depends_on', ARRAY['LYA', 'LYB']));

    -- GIRLS DIVISION: Semi Finals placeholders (will be determined after quarter-finals)
    INSERT INTO tournament_matches (
        id, tournament_id, match_number, round, match_date, match_time, venue_court,
        status, metadata
    ) VALUES
    -- PSF1: Winner PQF1 vs Winner PQF2
    (gen_random_uuid(), v_tournament_id, 203, 3, '2025-08-07', '10:00', 'SJKC YU HWA A',
     'scheduled', jsonb_build_object('division', 'girls', 'type', 'semi_final', 'match_code', 'PSF1',
     'team1_placeholder', 'Winner PQF1', 'team2_placeholder', 'Winner PQF2',
     'depends_on', ARRAY['PQF1', 'PQF2'])),
    
    -- PSF2: Winner PQF3 vs Winner PQF4
    (gen_random_uuid(), v_tournament_id, 204, 3, '2025-08-07', '10:30', 'SJKC YU HWA A',
     'scheduled', jsonb_build_object('division', 'girls', 'type', 'semi_final', 'match_code', 'PSF2',
     'team1_placeholder', 'Winner PQF3', 'team2_placeholder', 'Winner PQF4',
     'depends_on', ARRAY['PQF3', 'PQF4']));

    -- FINALS placeholders (August 7, 2025)
    INSERT INTO tournament_matches (
        id, tournament_id, match_number, round, match_date, match_time, venue_court,
        status, metadata
    ) VALUES
    -- Boys Final: Winner LSF1 vs Winner LSF2
    (gen_random_uuid(), v_tournament_id, 301, 4, '2025-08-07', '14:00', 'SJKC YU HWA A',
     'scheduled', jsonb_build_object('division', 'boys', 'type', 'final', 'match_code', 'L.Final',
     'team1_placeholder', 'Winner LSF1', 'team2_placeholder', 'Winner LSF2',
     'depends_on', ARRAY['LSF1', 'LSF2'])),
    
    -- Girls Final: Winner PSF1 vs Winner PSF2
    (gen_random_uuid(), v_tournament_id, 302, 4, '2025-08-07', '15:00', 'SJKC YU HWA A',
     'scheduled', jsonb_build_object('division', 'girls', 'type', 'final', 'match_code', 'P.Final',
     'team1_placeholder', 'Winner PSF1', 'team2_placeholder', 'Winner PSF2',
     'depends_on', ARRAY['PSF1', 'PSF2']));

    RAISE NOTICE 'Knockout brackets created successfully';
    RAISE NOTICE 'Boys: Second round groups (LXA, LXB, LYA, LYB) → Semi-finals → Final';
    RAISE NOTICE 'Girls: Quarter-finals → Semi-finals → Final';

END $$;

-- Function to update knockout match with actual teams after previous round completes
CREATE OR REPLACE FUNCTION update_knockout_match_teams()
RETURNS TRIGGER AS $$
DECLARE
    v_winner_id UUID;
    v_winner_name TEXT;
    v_dependent_match RECORD;
BEGIN
    -- Only process when a match is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Determine the winner
        IF NEW.score1 > NEW.score2 THEN
            v_winner_id := NEW.team1_id;
            SELECT team_name INTO v_winner_name FROM tournament_teams WHERE id = v_winner_id;
        ELSE
            v_winner_id := NEW.team2_id;
            SELECT team_name INTO v_winner_name FROM tournament_teams WHERE id = v_winner_id;
        END IF;

        -- Update team progression status
        UPDATE tournament_teams 
        SET current_stage = 
            CASE 
                WHEN NEW.round = 2 AND NEW.metadata->>'type' = 'second_round' THEN 'semi_final'
                WHEN NEW.round = 2 AND NEW.metadata->>'type' = 'quarter_final' THEN 'semi_final'
                WHEN NEW.round = 3 THEN 'final'
                WHEN NEW.round = 4 THEN 'champion'
                ELSE current_stage
            END
        WHERE id = v_winner_id;

        -- Find dependent matches and update them
        FOR v_dependent_match IN 
            SELECT * FROM tournament_matches 
            WHERE tournament_id = NEW.tournament_id
            AND status = 'scheduled'
            AND metadata->'depends_on' ? (NEW.metadata->>'match_code')
        LOOP
            -- Update the dependent match with the winner
            IF v_dependent_match.metadata->>'team1_placeholder' LIKE '%' || (NEW.metadata->>'match_code') THEN
                UPDATE tournament_matches
                SET team1_id = v_winner_id,
                    metadata = jsonb_set(metadata, '{team1_actual}', to_jsonb(v_winner_name))
                WHERE id = v_dependent_match.id;
            ELSIF v_dependent_match.metadata->>'team2_placeholder' LIKE '%' || (NEW.metadata->>'match_code') THEN
                UPDATE tournament_matches
                SET team2_id = v_winner_id,
                    metadata = jsonb_set(metadata, '{team2_actual}', to_jsonb(v_winner_name))
                WHERE id = v_dependent_match.id;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update knockout brackets when matches complete
DROP TRIGGER IF EXISTS update_knockout_teams_on_match_complete ON tournament_matches;
CREATE TRIGGER update_knockout_teams_on_match_complete
    AFTER UPDATE OF status ON tournament_matches
    FOR EACH ROW
    WHEN (NEW.round > 1)
    EXECUTE FUNCTION update_knockout_match_teams();

-- Add comment for documentation
COMMENT ON COLUMN tournament_matches.round IS '1=Group Stage, 2=Second Round/Quarter-Finals, 3=Semi-Finals, 4=Finals';