-- Migration: Calculate and Update Group Standings
-- Date: 2025-08-06
-- Purpose: Calculate final group standings from match results

DO $$
DECLARE
    v_tournament_id UUID := '66666666-6666-6666-6666-666666666666';
    v_team RECORD;
    v_stats RECORD;
BEGIN
    -- Reset all team statistics first
    UPDATE tournament_teams 
    SET group_wins = 0,
        group_losses = 0,
        group_played = 0,
        group_points = 0,
        points_for = 0,
        points_against = 0,
        group_position = NULL
    WHERE tournament_id = v_tournament_id;

    -- Calculate statistics for each team based on completed matches
    FOR v_team IN 
        SELECT id, team_name, pool, division 
        FROM tournament_teams 
        WHERE tournament_id = v_tournament_id
    LOOP
        -- Calculate wins, losses, points for/against
        WITH team_matches AS (
            SELECT 
                CASE 
                    WHEN m.team1_id = v_team.id THEN m.score1
                    WHEN m.team2_id = v_team.id THEN m.score2
                END as team_score,
                CASE 
                    WHEN m.team1_id = v_team.id THEN m.score2
                    WHEN m.team2_id = v_team.id THEN m.score1
                END as opponent_score
            FROM tournament_matches m
            WHERE m.tournament_id = v_tournament_id
            AND m.status = 'completed'
            AND (m.team1_id = v_team.id OR m.team2_id = v_team.id)
        ),
        team_stats AS (
            SELECT 
                COUNT(*) as played,
                SUM(CASE WHEN team_score > opponent_score THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN team_score < opponent_score THEN 1 ELSE 0 END) as losses,
                SUM(team_score) as points_for,
                SUM(opponent_score) as points_against
            FROM team_matches
        )
        SELECT * INTO v_stats FROM team_stats;

        -- Update team statistics
        UPDATE tournament_teams
        SET group_played = COALESCE(v_stats.played, 0),
            group_wins = COALESCE(v_stats.wins, 0),
            group_losses = COALESCE(v_stats.losses, 0),
            group_points = COALESCE(v_stats.wins, 0) * 2,
            points_for = COALESCE(v_stats.points_for, 0),
            points_against = COALESCE(v_stats.points_against, 0)
        WHERE id = v_team.id;
    END LOOP;

    -- Calculate group positions for each group
    WITH ranked_teams AS (
        SELECT 
            id,
            team_name,
            pool,
            division,
            group_points,
            points_for - points_against as points_diff,
            ROW_NUMBER() OVER (
                PARTITION BY pool, division 
                ORDER BY group_points DESC, 
                        (points_for - points_against) DESC,
                        points_for DESC
            ) as position
        FROM tournament_teams
        WHERE tournament_id = v_tournament_id
    )
    UPDATE tournament_teams t
    SET group_position = r.position
    FROM ranked_teams r
    WHERE t.id = r.id;

    -- Boys Division: Update qualification status for group winners
    -- Winners advance to second round groups
    UPDATE tournament_teams 
    SET qualification_status = 'qualified',
        current_stage = 'second_round'
    WHERE tournament_id = v_tournament_id 
    AND division = 'boys'
    AND group_position = 1;

    -- Specific boys teams based on PDF results
    UPDATE tournament_teams 
    SET qualification_status = 'qualified',
        current_stage = 'second_round',
        metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{second_round_group}', 
            CASE 
                WHEN team_name IN ('MALIM', 'WEN HUA', 'CHENG') THEN '"LXA"'
                WHEN team_name IN ('CHABAU', 'PAY CHEE', 'ALOR GAJAH', 'PAY FONG 1') THEN '"LXB"'
                WHEN team_name IN ('YU HWA', 'MERLIMAU', 'BACHANG', 'PAY CHIAO') THEN '"LYA"'
                WHEN team_name IN ('YU HSIEN', 'BKT BERUANG', 'PAY FONG 2') THEN '"LYB"'
            END::jsonb
        )
    WHERE tournament_id = v_tournament_id 
    AND division = 'boys'
    AND team_name IN (
        'MALIM', 'WEN HUA', 'CHENG', -- LXA
        'CHABAU', 'PAY CHEE', 'ALOR GAJAH', 'PAY FONG 1', -- LXB
        'YU HWA', 'MERLIMAU', 'BACHANG', 'PAY CHIAO', -- LYA
        'YU HSIEN', 'BKT BERUANG', 'PAY FONG 2' -- LYB (missing one team from PDF)
    );

    -- Girls Division: Update qualification status for group winners
    -- Winners advance directly to quarter-finals
    UPDATE tournament_teams 
    SET qualification_status = 'qualified',
        current_stage = 'quarter_final'
    WHERE tournament_id = v_tournament_id 
    AND division = 'girls'
    AND group_position = 1;

    -- Mark non-qualified teams as eliminated
    UPDATE tournament_teams 
    SET qualification_status = 'eliminated',
        current_stage = 'group_stage'
    WHERE tournament_id = v_tournament_id 
    AND group_position > 1
    AND division = 'boys';

    UPDATE tournament_teams 
    SET qualification_status = 'eliminated',
        current_stage = 'group_stage'
    WHERE tournament_id = v_tournament_id 
    AND group_position > 1
    AND division = 'girls';

    -- Log summary statistics
    RAISE NOTICE 'Standings calculation complete for tournament %', v_tournament_id;
    RAISE NOTICE 'Boys division: % teams qualified for second round', (
        SELECT COUNT(*) FROM tournament_teams 
        WHERE tournament_id = v_tournament_id 
        AND division = 'boys' 
        AND qualification_status = 'qualified'
    );
    RAISE NOTICE 'Girls division: % teams qualified for quarter-finals', (
        SELECT COUNT(*) FROM tournament_teams 
        WHERE tournament_id = v_tournament_id 
        AND division = 'girls' 
        AND qualification_status = 'qualified'
    );

END $$;

-- Create a function to get group standings for display
CREATE OR REPLACE FUNCTION get_group_standings(
    p_tournament_id UUID,
    p_group_code TEXT,
    p_division TEXT
) RETURNS TABLE (
    position INTEGER,
    team_name TEXT,
    played INTEGER,
    wins INTEGER,
    losses INTEGER,
    points INTEGER,
    points_for INTEGER,
    points_against INTEGER,
    points_diff INTEGER,
    qualified BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.group_position as position,
        t.team_name,
        t.group_played as played,
        t.group_wins as wins,
        t.group_losses as losses,
        t.group_points as points,
        t.points_for,
        t.points_against,
        (t.points_for - t.points_against) as points_diff,
        (t.qualification_status = 'qualified') as qualified
    FROM tournament_teams t
    WHERE t.tournament_id = p_tournament_id
    AND t.pool = p_group_code
    AND t.division = p_division
    ORDER BY t.group_position;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION get_group_standings IS 'Returns complete group standings with statistics for a specific group';