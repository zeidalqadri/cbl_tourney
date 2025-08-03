-- Create a simple function to look up team IDs
CREATE OR REPLACE FUNCTION get_tournament_team_id(p_team_name TEXT, p_division TEXT) 
RETURNS UUID AS $$
DECLARE
    v_team_id UUID;
BEGIN
    SELECT id INTO v_team_id
    FROM tournament_teams
    WHERE tournament_id = '66666666-6666-6666-6666-666666666666'
      AND team_name = p_team_name
      AND division = p_division
    LIMIT 1;
    
    RETURN v_team_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample matches for Day 1
DO $$
DECLARE
  tournament_uuid UUID := '66666666-6666-6666-6666-666666666666';
BEGIN
  -- Boys Group Stage matches at YU HWA
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 1, get_tournament_team_id('CHUNG CHENG', 'boys'), get_tournament_team_id('DURIAN TUNGGAL', 'boys'), '2025-08-04 08:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 3, get_tournament_team_id('PAYA RUMPUT', 'boys'), get_tournament_team_id('TEHEL', 'boys'), '2025-08-04 08:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 5, get_tournament_team_id('KUBU', 'boys'), get_tournament_team_id('BUNGA RAYA', 'boys'), '2025-08-04 08:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 7, get_tournament_team_id('MERLIMAU', 'boys'), get_tournament_team_id('JASIN', 'boys'), '2025-08-04 09:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 9, get_tournament_team_id('DURIAN TUNGGAL', 'boys'), get_tournament_team_id('PEI MIN', 'boys'), '2025-08-04 09:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 11, get_tournament_team_id('TEHEL', 'boys'), get_tournament_team_id('DURIAN DAUN', 'boys'), '2025-08-04 09:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 13, get_tournament_team_id('BUNGA RAYA', 'boys'), get_tournament_team_id('DURIAN TUNGGAL 2', 'boys'), '2025-08-04 10:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 15, get_tournament_team_id('JASIN', 'boys'), get_tournament_team_id('EH HOCK', 'boys'), '2025-08-04 10:20:00+08', 'SJKC YU HWA', 'pending');

  -- Boys Group Stage matches at MALIM
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 2, get_tournament_team_id('MALIM', 'boys'), get_tournament_team_id('TING HWA', 'boys'), '2025-08-04 08:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 4, get_tournament_team_id('WEN HUA', 'boys'), get_tournament_team_id('AYER KEROH', 'boys'), '2025-08-04 08:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 6, get_tournament_team_id('CHENG', 'boys'), get_tournament_team_id('SHUH YEN', 'boys'), '2025-08-04 08:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 8, get_tournament_team_id('TING HWA', 'boys'), get_tournament_team_id('BERTAM ULU', 'boys'), '2025-08-04 09:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 10, get_tournament_team_id('AYER KEROH', 'boys'), get_tournament_team_id('SIANG LIN', 'boys'), '2025-08-04 09:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 12, get_tournament_team_id('SHUH YEN', 'boys'), get_tournament_team_id('MASJID TANAH', 'boys'), '2025-08-04 09:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 14, get_tournament_team_id('BERTAM ULU', 'boys'), get_tournament_team_id('MALIM', 'boys'), '2025-08-04 10:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 16, get_tournament_team_id('SIANG LIN', 'boys'), get_tournament_team_id('WEN HUA', 'boys'), '2025-08-04 10:20:00+08', 'SJKC MALIM', 'pending');

  -- Girls Group Stage matches at YU HWA  
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 43, get_tournament_team_id('KEH SENG', 'girls'), get_tournament_team_id('SHUH YEN', 'girls'), '2025-08-04 15:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 45, get_tournament_team_id('PENGKALAN BALAK', 'girls'), get_tournament_team_id('PAYA RUMPUT', 'girls'), '2025-08-04 15:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 47, get_tournament_team_id('DURIAN TUNGGAL', 'girls'), get_tournament_team_id('JASIN', 'girls'), '2025-08-04 15:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 49, get_tournament_team_id('RENDAH KG LAPAN', 'girls'), get_tournament_team_id('BUNGA RAYA', 'girls'), '2025-08-04 16:00:00+08', 'SJKC YU HWA', 'pending');

  -- Girls Group Stage matches at MALIM
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 44, get_tournament_team_id('PAY FONG 1', 'girls'), get_tournament_team_id('BERTAM ULU', 'girls'), '2025-08-04 15:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 46, get_tournament_team_id('SIANG LIN', 'girls'), get_tournament_team_id('PAY FONG 1', 'girls'), '2025-08-04 15:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 48, get_tournament_team_id('PING MING', 'girls'), get_tournament_team_id('ALOR GAJAH', 'girls'), '2025-08-04 15:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 50, get_tournament_team_id('TING HWA', 'girls'), get_tournament_team_id('PING MING', 'girls'), '2025-08-04 16:00:00+08', 'SJKC MALIM', 'pending')
  ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS get_tournament_team_id(TEXT, TEXT);