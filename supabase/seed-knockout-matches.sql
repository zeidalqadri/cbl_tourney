-- MSS Melaka 2025 Basketball Tournament - Knockout Stage Matches
-- This script loads all knockout stage matches (Days 3-4) with placeholder teams

DO $$
DECLARE
  tournament_uuid UUID := '66666666-6666-6666-6666-666666666666';
  
  -- Function to create placeholder team reference
  FUNCTION create_placeholder_team(team_code TEXT, div TEXT) RETURNS UUID AS
  $func$
  DECLARE
    team_uuid UUID;
  BEGIN
    -- Generate a deterministic UUID for placeholder teams
    team_uuid := uuid_generate_v5(tournament_uuid, team_code || '-' || div);
    
    -- Insert placeholder team if it doesn't exist
    INSERT INTO tournament_teams (id, tournament_id, team_name, division, pool, metadata)
    VALUES (
      team_uuid,
      tournament_uuid,
      team_code, -- e.g., "Winner Group LA", "Champion PA"
      div,
      'KNOCKOUT', -- Special pool for knockout stage
      jsonb_build_object(
        'is_placeholder', true,
        'source_group', regexp_replace(team_code, '^(Winner Group |Champion )', ''),
        'type', CASE 
          WHEN team_code LIKE 'Winner Group%' THEN 'group_winner'
          WHEN team_code LIKE 'Champion%' THEN 'group_champion'
          ELSE 'knockout'
        END
      )
    )
    ON CONFLICT (id) DO UPDATE
    SET metadata = tournament_teams.metadata || jsonb_build_object('updated_at', NOW());
    
    RETURN team_uuid;
  END;
  $func$ LANGUAGE plpgsql;
  
BEGIN
  -- Day 3: August 6, 2025 - Knockout Stage
  -- Boys Second Round (Groups LXA, LXB, LYA, LYB)
  
  -- Game 103: LXA - Johan LA vs Johan LB
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 103, 2,
    create_placeholder_team('Winner Group LA', 'boys'),
    create_placeholder_team('Winner Group LB', 'boys'),
    '2025-08-06 08:20:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LXA', 'division', 'boys')
  );
  
  -- Game 104: LXB - Johan LD vs Johan LE
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 104, 2,
    create_placeholder_team('Winner Group LD', 'boys'),
    create_placeholder_team('Winner Group LE', 'boys'),
    '2025-08-06 08:40:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LXB', 'division', 'boys')
  );
  
  -- Game 105: LXB - Johan LF vs Johan LG
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 105, 2,
    create_placeholder_team('Winner Group LF', 'boys'),
    create_placeholder_team('Winner Group LG', 'boys'),
    '2025-08-06 09:00:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LXB', 'division', 'boys')
  );
  
  -- Game 106: LYA - Johan LH vs Johan LI
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 106, 2,
    create_placeholder_team('Winner Group LH', 'boys'),
    create_placeholder_team('Winner Group LI', 'boys'),
    '2025-08-06 09:20:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LYA', 'division', 'boys')
  );
  
  -- Game 107: LYA - Johan LJ vs Johan LK
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 107, 2,
    create_placeholder_team('Winner Group LJ', 'boys'),
    create_placeholder_team('Winner Group LK', 'boys'),
    '2025-08-06 09:40:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LYA', 'division', 'boys')
  );
  
  -- Game 108: LYB - Johan LM vs Johan LN
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 108, 2,
    create_placeholder_team('Winner Group LM', 'boys'),
    create_placeholder_team('Winner Group LN', 'boys'),
    '2025-08-06 10:00:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LYB', 'division', 'boys')
  );
  
  -- Game 110: LXA - Johan LC vs Johan LA
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 110, 2,
    create_placeholder_team('Winner Group LC', 'boys'),
    create_placeholder_team('Winner Group LA', 'boys'),
    '2025-08-06 10:40:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LXA', 'division', 'boys')
  );
  
  -- Game 111: LXB - Johan LD vs Johan LF
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 111, 2,
    create_placeholder_team('Winner Group LD', 'boys'),
    create_placeholder_team('Winner Group LF', 'boys'),
    '2025-08-06 11:00:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LXB', 'division', 'boys')
  );
  
  -- Game 112: LXB - Johan LE vs Johan LG
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 112, 2,
    create_placeholder_team('Winner Group LE', 'boys'),
    create_placeholder_team('Winner Group LG', 'boys'),
    '2025-08-06 11:20:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LXB', 'division', 'boys')
  );
  
  -- Game 113: LYA - Johan LH vs Johan LJ
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 113, 2,
    create_placeholder_team('Winner Group LH', 'boys'),
    create_placeholder_team('Winner Group LJ', 'boys'),
    '2025-08-06 11:40:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LYA', 'division', 'boys')
  );
  
  -- Game 114: LYA - Johan LI vs Johan LK
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 114, 2,
    create_placeholder_team('Winner Group LI', 'boys'),
    create_placeholder_team('Winner Group LK', 'boys'),
    '2025-08-06 12:00:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LYA', 'division', 'boys')
  );
  
  -- Game 115: LYB - Johan LN vs Johan LL
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 115, 2,
    create_placeholder_team('Winner Group LN', 'boys'),
    create_placeholder_team('Winner Group LL', 'boys'),
    '2025-08-06 12:20:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LYB', 'division', 'boys')
  );
  
  -- Game 117: LXA - Johan LA vs Johan LB
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 117, 2,
    create_placeholder_team('Winner Group LA', 'boys'),
    create_placeholder_team('Winner Group LB', 'boys'),
    '2025-08-06 13:00:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LXA', 'division', 'boys')
  );
  
  -- Game 118: LXB - Johan LG vs Johan LD
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 118, 2,
    create_placeholder_team('Winner Group LG', 'boys'),
    create_placeholder_team('Winner Group LD', 'boys'),
    '2025-08-06 13:20:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LXB', 'division', 'boys')
  );
  
  -- Game 119: LXB - Johan LF vs Johan LE
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 119, 2,
    create_placeholder_team('Winner Group LF', 'boys'),
    create_placeholder_team('Winner Group LE', 'boys'),
    '2025-08-06 13:40:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LXB', 'division', 'boys')
  );
  
  -- Game 120: LYA - Johan LK vs Johan LH
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 120, 2,
    create_placeholder_team('Winner Group LK', 'boys'),
    create_placeholder_team('Winner Group LH', 'boys'),
    '2025-08-06 14:00:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LYA', 'division', 'boys')
  );
  
  -- Game 121: LYA - Johan LJ vs Johan LI
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 121, 2,
    create_placeholder_team('Winner Group LJ', 'boys'),
    create_placeholder_team('Winner Group LI', 'boys'),
    '2025-08-06 14:20:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LYA', 'division', 'boys')
  );
  
  -- Game 122: LYB - Johan LL vs Johan LM
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 122, 2,
    create_placeholder_team('Winner Group LL', 'boys'),
    create_placeholder_team('Winner Group LM', 'boys'),
    '2025-08-06 14:40:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'second_round', 'group', 'LYB', 'division', 'boys')
  );
  
  -- Girls Quarter Finals
  
  -- Game 102: PQF1 - Juara PA vs Juara PB
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 102, 2,
    create_placeholder_team('Champion PA', 'girls'),
    create_placeholder_team('Champion PB', 'girls'),
    '2025-08-06 08:00:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'quarter_final', 'match_code', 'PQF1', 'division', 'girls')
  );
  
  -- Game 109: PQF2 - Juara PC vs Juara PD
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 109, 2,
    create_placeholder_team('Champion PC', 'girls'),
    create_placeholder_team('Champion PD', 'girls'),
    '2025-08-06 10:20:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'quarter_final', 'match_code', 'PQF2', 'division', 'girls')
  );
  
  -- Game 116: PQF3 - Juara PE vs Juara PF
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 116, 2,
    create_placeholder_team('Champion PE', 'girls'),
    create_placeholder_team('Champion PF', 'girls'),
    '2025-08-06 12:40:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'quarter_final', 'match_code', 'PQF3', 'division', 'girls')
  );
  
  -- Game 123: PQF4 - Juara PG vs Juara PH
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 123, 2,
    create_placeholder_team('Champion PG', 'girls'),
    create_placeholder_team('Champion PH', 'girls'),
    '2025-08-06 13:00:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'quarter_final', 'match_code', 'PQF4', 'division', 'girls')
  );
  
  -- Day 4: August 7, 2025 - Finals Day
  
  -- Game 124: PSF1 - Winner of PQF1 vs Winner of PQF2
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 124, 3,
    create_placeholder_team('Winner PQF1', 'girls'),
    create_placeholder_team('Winner PQF2', 'girls'),
    '2025-08-07 08:00:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'semi_final', 'match_code', 'PSF1', 'division', 'girls')
  );
  
  -- Game 125: PSF2 - Winner of PQF3 vs Winner of PQF4
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 125, 3,
    create_placeholder_team('Winner PQF3', 'girls'),
    create_placeholder_team('Winner PQF4', 'girls'),
    '2025-08-07 08:40:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'semi_final', 'match_code', 'PSF2', 'division', 'girls')
  );
  
  -- Game 126: LSF1 - Winner of LXA vs Winner of LXB
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 126, 3,
    create_placeholder_team('Winner LXA', 'boys'),
    create_placeholder_team('Winner LXB', 'boys'),
    '2025-08-07 09:20:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'semi_final', 'match_code', 'LSF1', 'division', 'boys')
  );
  
  -- Game 127: LSF2 - Winner of LYA vs Winner of LYB
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 127, 3,
    create_placeholder_team('Winner LYA', 'boys'),
    create_placeholder_team('Winner LYB', 'boys'),
    '2025-08-07 10:00:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'semi_final', 'match_code', 'LSF2', 'division', 'boys')
  );
  
  -- Game 128: P.FINAL - Winner of PSF1 vs Winner of PSF2
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 128, 4,
    create_placeholder_team('Winner PSF1', 'girls'),
    create_placeholder_team('Winner PSF2', 'girls'),
    '2025-08-07 11:00:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'final', 'match_code', 'P.FINAL', 'division', 'girls')
  );
  
  -- Game 129: L.FINAL - Winner of LSF1 vs Winner of LSF2
  INSERT INTO tournament_matches (
    id, tournament_id, match_number, round, 
    team1_id, team2_id, 
    scheduled_time, venue, status, metadata
  ) VALUES (
    uuid_generate_v4(), tournament_uuid, 129, 4,
    create_placeholder_team('Winner LSF1', 'boys'),
    create_placeholder_team('Winner LSF2', 'boys'),
    '2025-08-07 12:00:00+08', 'SJKC YU HWA (Court A)', 'scheduled',
    jsonb_build_object('type', 'final', 'match_code', 'L.FINAL', 'division', 'boys')
  );
  
  RAISE NOTICE 'Knockout stage matches successfully created';
END $$;

-- Create function to update knockout matches when group winners are determined
CREATE OR REPLACE FUNCTION update_knockout_placeholder(
  p_group_code TEXT,
  p_division TEXT,
  p_winner_team_id UUID
) RETURNS void AS $$
BEGIN
  -- Update all matches where this placeholder team is involved
  UPDATE tournament_matches
  SET 
    team1_id = p_winner_team_id,
    metadata = metadata || jsonb_build_object('team1_updated_from', team1_id, 'team1_updated_at', NOW())
  WHERE team1_id IN (
    SELECT id FROM tournament_teams 
    WHERE team_name = 'Winner Group ' || p_group_code
    OR team_name = 'Champion ' || p_group_code
  );
  
  UPDATE tournament_matches
  SET 
    team2_id = p_winner_team_id,
    metadata = metadata || jsonb_build_object('team2_updated_from', team2_id, 'team2_updated_at', NOW())
  WHERE team2_id IN (
    SELECT id FROM tournament_teams 
    WHERE team_name = 'Winner Group ' || p_group_code
    OR team_name = 'Champion ' || p_group_code
  );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update knockout matches when group stage completes
CREATE OR REPLACE FUNCTION check_group_completion() RETURNS trigger AS $$
DECLARE
  v_group_complete BOOLEAN;
  v_winner_team_id UUID;
  v_group_code TEXT;
BEGIN
  -- Only check on match completion
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get group code from team's pool
    SELECT DISTINCT t.pool INTO v_group_code
    FROM tournament_teams t
    WHERE t.id IN (NEW.team1_id, NEW.team2_id)
    AND t.pool NOT IN ('KNOCKOUT');
    
    IF v_group_code IS NOT NULL THEN
      -- Check if all group matches are complete
      SELECT NOT EXISTS (
        SELECT 1 
        FROM tournament_matches m
        JOIN tournament_teams t1 ON m.team1_id = t1.id
        JOIN tournament_teams t2 ON m.team2_id = t2.id
        WHERE m.round = 1
        AND (t1.pool = v_group_code OR t2.pool = v_group_code)
        AND m.status != 'completed'
      ) INTO v_group_complete;
      
      IF v_group_complete THEN
        -- Get the group winner (top team by wins, then point differential)
        WITH group_standings AS (
          SELECT 
            t.id as team_id,
            t.division,
            COUNT(CASE WHEN m.winner_id = t.id THEN 1 END) as wins,
            SUM(CASE 
              WHEN m.team1_id = t.id THEN m.score1 - m.score2
              WHEN m.team2_id = t.id THEN m.score2 - m.score1
              ELSE 0
            END) as point_diff
          FROM tournament_teams t
          LEFT JOIN tournament_matches m ON (m.team1_id = t.id OR m.team2_id = t.id) AND m.status = 'completed'
          WHERE t.pool = v_group_code
          GROUP BY t.id, t.division
          ORDER BY wins DESC, point_diff DESC
          LIMIT 1
        )
        SELECT team_id INTO v_winner_team_id FROM group_standings;
        
        -- Update knockout placeholders
        IF v_winner_team_id IS NOT NULL THEN
          PERFORM update_knockout_placeholder(v_group_code, NEW.division, v_winner_team_id);
          RAISE NOTICE 'Updated knockout matches for group % winner', v_group_code;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on match updates
DROP TRIGGER IF EXISTS trg_check_group_completion ON tournament_matches;
CREATE TRIGGER trg_check_group_completion
AFTER UPDATE ON tournament_matches
FOR EACH ROW
EXECUTE FUNCTION check_group_completion();