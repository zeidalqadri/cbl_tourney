-- Load remaining matches for MSS Melaka 2025 Tournament
-- We already have 24 matches, need to add the remaining 105 matches

DO $$
DECLARE
  tournament_uuid UUID := '66666666-6666-6666-6666-666666666666';
  
  -- Function to get team ID by name and division
  FUNCTION get_team_id_by_name(team_name TEXT, div TEXT) RETURNS UUID AS
  $func$
  DECLARE
    team_uuid UUID;
  BEGIN
    SELECT id INTO team_uuid 
    FROM tournament_teams 
    WHERE tournament_id = tournament_uuid 
      AND team_name = team_name
      AND division = div
    LIMIT 1;
    
    RETURN team_uuid;
  END;
  $func$ LANGUAGE plpgsql;

BEGIN
  -- First, let's check which matches already exist
  -- Assuming matches 1-24 are already loaded based on the count
  
  -- Continue from match 25 onwards
  -- Day 1: August 4, 2025 - Boys Group Stage (continuing from match 25)
  
  -- YU HWA (Gelanggang A) - Boys matches
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 25, get_team_id_by_name('RENDAH KG LAPAN', 'boys'), get_team_id_by_name('TIANG DERAS', 'boys'), '2025-08-04 12:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 27, get_team_id_by_name('MELAKA PINDAH', 'boys'), get_team_id_by_name('AIR BARUK', 'boys'), '2025-08-04 12:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 29, get_team_id_by_name('LENDU', 'boys'), get_team_id_by_name('PAY FONG 2', 'boys'), '2025-08-04 12:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 31, get_team_id_by_name('TIANG DERAS', 'boys'), get_team_id_by_name('BANDA KABA', 'boys'), '2025-08-04 13:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 33, get_team_id_by_name('AIR BARUK', 'boys'), get_team_id_by_name('PENGKALAN BALAK', 'boys'), '2025-08-04 13:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 35, get_team_id_by_name('PAY FONG 2', 'boys'), get_team_id_by_name('MALIM JAYA', 'boys'), '2025-08-04 13:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 37, get_team_id_by_name('BANDA KABA', 'boys'), get_team_id_by_name('RENDAH KG LAPAN', 'boys'), '2025-08-04 14:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 39, get_team_id_by_name('PENGKALAN BALAK', 'boys'), get_team_id_by_name('MELAKA PINDAH', 'boys'), '2025-08-04 14:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 41, get_team_id_by_name('MALIM JAYA', 'boys'), get_team_id_by_name('LENDU', 'boys'), '2025-08-04 14:40:00+08', 'SJKC YU HWA', 'pending')
  ON CONFLICT (tournament_id, round, match_number) DO NOTHING;
  
  -- MALIM (Gelanggang B) - Boys matches (continuing)
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 26, get_team_id_by_name('SG UDANG', 'boys'), get_team_id_by_name('MACHAP UMBOO', 'boys'), '2025-08-04 12:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 28, get_team_id_by_name('PAY FONG 1', 'boys'), get_team_id_by_name('KEH SENG', 'boys'), '2025-08-04 12:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 30, get_team_id_by_name('PAYA MENGKUANG', 'boys'), get_team_id_by_name('PONDOK BATANG', 'boys'), '2025-08-04 12:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 32, get_team_id_by_name('POH LAN', 'boys'), get_team_id_by_name('CHABAU', 'boys'), '2025-08-04 13:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 34, get_team_id_by_name('PING MING', 'boys'), get_team_id_by_name('CHUNG HWA', 'boys'), '2025-08-04 13:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 36, get_team_id_by_name('MACHAP UMBOO', 'boys'), get_team_id_by_name('ALOR GAJAH', 'boys'), '2025-08-04 13:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 38, get_team_id_by_name('KEH SENG', 'boys'), get_team_id_by_name('PERMATANG PASIR', 'boys'), '2025-08-04 14:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 40, get_team_id_by_name('CHABAU', 'boys'), get_team_id_by_name('PAYA MENGKUANG', 'boys'), '2025-08-04 14:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 42, get_team_id_by_name('PONDOK BATANG', 'boys'), get_team_id_by_name('POH LAN', 'boys'), '2025-08-04 14:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 43, get_team_id_by_name('CHUNG HWA', 'boys'), get_team_id_by_name('PAY CHEE', 'boys'), '2025-08-04 15:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 44, get_team_id_by_name('ALOR GAJAH', 'boys'), get_team_id_by_name('SG UDANG', 'boys'), '2025-08-04 15:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 45, get_team_id_by_name('PERMATANG PASIR', 'boys'), get_team_id_by_name('PAY FONG 1', 'boys'), '2025-08-04 16:00:00+08', 'SJKC MALIM', 'pending')
  ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

  -- Day 2: August 5, 2025 - Girls Group Stage
  -- YU HWA (Gelanggang A) - Girls matches
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 46, get_team_id_by_name('PAY FONG 1', 'girls'), get_team_id_by_name('BERTAM ULU', 'girls'), '2025-08-05 08:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 48, get_team_id_by_name('SIANG LIN', 'girls'), get_team_id_by_name('SG UDANG', 'girls'), '2025-08-05 08:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 50, get_team_id_by_name('PING MING', 'girls'), get_team_id_by_name('CHUNG HWA', 'girls'), '2025-08-05 08:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 52, get_team_id_by_name('ALOR GAJAH', 'girls'), get_team_id_by_name('TING HWA', 'girls'), '2025-08-05 09:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 54, get_team_id_by_name('BANDA KABA', 'girls'), get_team_id_by_name('PERMATANG PASIR', 'girls'), '2025-08-05 09:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 56, get_team_id_by_name('KUBU', 'girls'), get_team_id_by_name('NOTRE DAME', 'girls'), '2025-08-05 09:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 58, get_team_id_by_name('PAY CHEE', 'girls'), get_team_id_by_name('PAYA MENGKUANG', 'girls'), '2025-08-05 10:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 60, get_team_id_by_name('LENDU', 'girls'), get_team_id_by_name('AIR BARUK', 'girls'), '2025-08-05 10:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 62, get_team_id_by_name('CHUNG HWA', 'girls'), get_team_id_by_name('KUANG YAH', 'girls'), '2025-08-05 10:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 64, get_team_id_by_name('TING HWA', 'girls'), get_team_id_by_name('PING MING', 'girls'), '2025-08-05 11:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 66, get_team_id_by_name('PAY FONG 1', 'girls'), get_team_id_by_name('SIANG LIN', 'girls'), '2025-08-05 11:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 68, get_team_id_by_name('BERTAM ULU', 'girls'), get_team_id_by_name('SG UDANG', 'girls'), '2025-08-05 11:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 70, get_team_id_by_name('BANDA KABA', 'girls'), get_team_id_by_name('KUBU', 'girls'), '2025-08-05 12:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 72, get_team_id_by_name('PERMATANG PASIR', 'girls'), get_team_id_by_name('NOTRE DAME', 'girls'), '2025-08-05 12:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 74, get_team_id_by_name('KUANG YAH', 'girls'), get_team_id_by_name('TING HWA', 'girls'), '2025-08-05 12:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 76, get_team_id_by_name('PING MING', 'girls'), get_team_id_by_name('ALOR GAJAH', 'girls'), '2025-08-05 13:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 78, get_team_id_by_name('PAY CHEE', 'girls'), get_team_id_by_name('LENDU', 'girls'), '2025-08-05 13:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 80, get_team_id_by_name('PAYA MENGKUANG', 'girls'), get_team_id_by_name('AIR BARUK', 'girls'), '2025-08-05 13:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 82, get_team_id_by_name('SG UDANG', 'girls'), get_team_id_by_name('PAY FONG 1', 'girls'), '2025-08-05 14:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 84, get_team_id_by_name('SIANG LIN', 'girls'), get_team_id_by_name('BERTAM ULU', 'girls'), '2025-08-05 14:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 86, get_team_id_by_name('ALOR GAJAH', 'girls'), get_team_id_by_name('KUANG YAH', 'girls'), '2025-08-05 14:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 88, get_team_id_by_name('TING HWA', 'girls'), get_team_id_by_name('CHUNG HWA', 'girls'), '2025-08-05 15:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 90, get_team_id_by_name('NOTRE DAME', 'girls'), get_team_id_by_name('BANDA KABA', 'girls'), '2025-08-05 15:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 92, get_team_id_by_name('KUBU', 'girls'), get_team_id_by_name('PERMATANG PASIR', 'girls'), '2025-08-05 15:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 94, get_team_id_by_name('AIR BARUK', 'girls'), get_team_id_by_name('PAY CHEE', 'girls'), '2025-08-05 16:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 96, get_team_id_by_name('LENDU', 'girls'), get_team_id_by_name('PAYA MENGKUANG', 'girls'), '2025-08-05 16:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 98, get_team_id_by_name('CHUNG HWA', 'girls'), get_team_id_by_name('ALOR GAJAH', 'girls'), '2025-08-05 16:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 100, get_team_id_by_name('KUANG YAH', 'girls'), get_team_id_by_name('PING MING', 'girls'), '2025-08-05 17:00:00+08', 'SJKC YU HWA', 'pending')
  ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

  -- MALIM (Gelanggang B) - Girls matches
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 47, get_team_id_by_name('TANJUNG TUAN', 'girls'), get_team_id_by_name('MACHAP UMBOO', 'girls'), '2025-08-05 08:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 49, get_team_id_by_name('MASJID TANAH', 'girls'), get_team_id_by_name('WEN HUA', 'girls'), '2025-08-05 08:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 51, get_team_id_by_name('SG UDANG', 'girls'), get_team_id_by_name('POH LAN', 'girls'), '2025-08-05 08:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 53, get_team_id_by_name('PEI MIN', 'girls'), get_team_id_by_name('PAY FONG 2', 'girls'), '2025-08-05 09:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 55, get_team_id_by_name('CHUNG HWA', 'girls'), get_team_id_by_name('MELAKA PINDAH', 'girls'), '2025-08-05 09:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 57, get_team_id_by_name('MALIM', 'girls'), get_team_id_by_name('CHUNG CHENG', 'girls'), '2025-08-05 09:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 59, get_team_id_by_name('KEH SENG', 'girls'), get_team_id_by_name('SHUH YEN', 'girls'), '2025-08-05 10:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 61, get_team_id_by_name('PENGKALAN BALAK', 'girls'), get_team_id_by_name('PAYA RUMPUT', 'girls'), '2025-08-05 10:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 63, get_team_id_by_name('POH LAN', 'girls'), get_team_id_by_name('PEI MIN', 'girls'), '2025-08-05 10:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 65, get_team_id_by_name('PAY FONG 2', 'girls'), get_team_id_by_name('AYER KEROH', 'girls'), '2025-08-05 11:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 67, get_team_id_by_name('TANJUNG TUAN', 'girls'), get_team_id_by_name('MASJID TANAH', 'girls'), '2025-08-05 11:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 69, get_team_id_by_name('MACHAP UMBOO', 'girls'), get_team_id_by_name('WEN HUA', 'girls'), '2025-08-05 11:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 71, get_team_id_by_name('CHUNG HWA', 'girls'), get_team_id_by_name('MALIM', 'girls'), '2025-08-05 12:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 73, get_team_id_by_name('MELAKA PINDAH', 'girls'), get_team_id_by_name('CHUNG CHENG', 'girls'), '2025-08-05 12:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 75, get_team_id_by_name('AYER KEROH', 'girls'), get_team_id_by_name('POH LAN', 'girls'), '2025-08-05 12:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 77, get_team_id_by_name('PEI MIN', 'girls'), get_team_id_by_name('SG UDANG', 'girls'), '2025-08-05 13:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 79, get_team_id_by_name('KEH SENG', 'girls'), get_team_id_by_name('PENGKALAN BALAK', 'girls'), '2025-08-05 13:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 81, get_team_id_by_name('SHUH YEN', 'girls'), get_team_id_by_name('PAYA RUMPUT', 'girls'), '2025-08-05 13:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 83, get_team_id_by_name('WEN HUA', 'girls'), get_team_id_by_name('TANJUNG TUAN', 'girls'), '2025-08-05 14:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 85, get_team_id_by_name('MASJID TANAH', 'girls'), get_team_id_by_name('MACHAP UMBOO', 'girls'), '2025-08-05 14:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 87, get_team_id_by_name('SG UDANG', 'girls'), get_team_id_by_name('AYER KEROH', 'girls'), '2025-08-05 14:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 89, get_team_id_by_name('POH LAN', 'girls'), get_team_id_by_name('PAY FONG 2', 'girls'), '2025-08-05 15:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 91, get_team_id_by_name('CHUNG CHENG', 'girls'), get_team_id_by_name('CHUNG HWA', 'girls'), '2025-08-05 15:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 93, get_team_id_by_name('MALIM', 'girls'), get_team_id_by_name('MELAKA PINDAH', 'girls'), '2025-08-05 15:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 95, get_team_id_by_name('PAYA RUMPUT', 'girls'), get_team_id_by_name('KEH SENG', 'girls'), '2025-08-05 16:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 97, get_team_id_by_name('PENGKALAN BALAK', 'girls'), get_team_id_by_name('SHUH YEN', 'girls'), '2025-08-05 16:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 99, get_team_id_by_name('AYER KEROH', 'girls'), get_team_id_by_name('PEI MIN', 'girls'), '2025-08-05 16:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 101, get_team_id_by_name('PAY FONG 2', 'girls'), get_team_id_by_name('SG UDANG', 'girls'), '2025-08-05 17:00:00+08', 'SJKC MALIM', 'pending')
  ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

  -- Day 3: August 6, 2025 - Second Round and Quarter Finals
  -- All matches at YU HWA
  -- Placeholder matches for knockout rounds (will be updated when group winners are determined)
  
  -- Girls Quarter Finals
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
  (tournament_uuid, 2, 102, NULL, NULL, '2025-08-06 08:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "quarter_final", "division": "girls", "team1_placeholder": "Winner PA", "team2_placeholder": "Winner PB"}'),
  (tournament_uuid, 2, 109, NULL, NULL, '2025-08-06 10:20:00+08', 'SJKC YU HWA', 'pending', '{"type": "quarter_final", "division": "girls", "team1_placeholder": "Winner PC", "team2_placeholder": "Winner PD"}'),
  (tournament_uuid, 2, 116, NULL, NULL, '2025-08-06 12:40:00+08', 'SJKC YU HWA', 'pending', '{"type": "quarter_final", "division": "girls", "team1_placeholder": "Winner PE", "team2_placeholder": "Winner PF"}'),
  (tournament_uuid, 2, 123, NULL, NULL, '2025-08-06 15:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "quarter_final", "division": "girls", "team1_placeholder": "Winner PG", "team2_placeholder": "Winner PH"}')
  ON CONFLICT (tournament_id, round, match_number) DO NOTHING;
  
  -- Boys Second Round - Group LXA/LXB/LYA/LYB matches
  -- These will be populated with group winners
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
  -- LXA Group matches
  (tournament_uuid, 2, 103, NULL, NULL, '2025-08-06 08:20:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LXA", "team1_placeholder": "Winner LB", "team2_placeholder": "Winner LC"}'),
  (tournament_uuid, 2, 110, NULL, NULL, '2025-08-06 10:40:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LXA", "team1_placeholder": "Winner LC", "team2_placeholder": "Winner LA"}'),
  (tournament_uuid, 2, 117, NULL, NULL, '2025-08-06 13:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LXA", "team1_placeholder": "Winner LA", "team2_placeholder": "Winner LB"}'),
  
  -- LXB Group matches
  (tournament_uuid, 2, 104, NULL, NULL, '2025-08-06 08:40:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LXB", "team1_placeholder": "Winner LD", "team2_placeholder": "Winner LE"}'),
  (tournament_uuid, 2, 105, NULL, NULL, '2025-08-06 09:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LXB", "team1_placeholder": "Winner LF", "team2_placeholder": "Winner LG"}'),
  (tournament_uuid, 2, 111, NULL, NULL, '2025-08-06 11:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LXB", "team1_placeholder": "Winner LD", "team2_placeholder": "Winner LF"}'),
  (tournament_uuid, 2, 112, NULL, NULL, '2025-08-06 11:20:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LXB", "team1_placeholder": "Winner LE", "team2_placeholder": "Winner LG"}'),
  (tournament_uuid, 2, 118, NULL, NULL, '2025-08-06 13:20:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LXB", "team1_placeholder": "Winner LG", "team2_placeholder": "Winner LD"}'),
  (tournament_uuid, 2, 119, NULL, NULL, '2025-08-06 13:40:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LXB", "team1_placeholder": "Winner LF", "team2_placeholder": "Winner LE"}'),
  
  -- LYA Group matches
  (tournament_uuid, 2, 106, NULL, NULL, '2025-08-06 09:20:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LYA", "team1_placeholder": "Winner LH", "team2_placeholder": "Winner LI"}'),
  (tournament_uuid, 2, 107, NULL, NULL, '2025-08-06 09:40:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LYA", "team1_placeholder": "Winner LJ", "team2_placeholder": "Winner LK"}'),
  (tournament_uuid, 2, 113, NULL, NULL, '2025-08-06 11:40:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LYA", "team1_placeholder": "Winner LH", "team2_placeholder": "Winner LJ"}'),
  (tournament_uuid, 2, 114, NULL, NULL, '2025-08-06 12:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LYA", "team1_placeholder": "Winner LI", "team2_placeholder": "Winner LK"}'),
  (tournament_uuid, 2, 120, NULL, NULL, '2025-08-06 14:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LYA", "team1_placeholder": "Winner LK", "team2_placeholder": "Winner LH"}'),
  (tournament_uuid, 2, 121, NULL, NULL, '2025-08-06 14:20:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LYA", "team1_placeholder": "Winner LJ", "team2_placeholder": "Winner LI"}'),
  
  -- LYB Group matches
  (tournament_uuid, 2, 108, NULL, NULL, '2025-08-06 10:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LYB", "team1_placeholder": "Winner LM", "team2_placeholder": "Winner LN"}'),
  (tournament_uuid, 2, 115, NULL, NULL, '2025-08-06 12:20:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LYB", "team1_placeholder": "Winner LN", "team2_placeholder": "Winner LL"}'),
  (tournament_uuid, 2, 122, NULL, NULL, '2025-08-06 14:40:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LYB", "team1_placeholder": "Winner LL", "team2_placeholder": "Winner LM"}')
  ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

  -- Day 4: August 7, 2025 - Semi Finals and Finals
  -- All matches at YU HWA
  
  -- Girls Semi Finals
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
  (tournament_uuid, 3, 124, NULL, NULL, '2025-08-07 08:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "semi_final", "division": "girls", "team1_placeholder": "Winner M102", "team2_placeholder": "Winner M109"}'),
  (tournament_uuid, 3, 125, NULL, NULL, '2025-08-07 08:40:00+08', 'SJKC YU HWA', 'pending', '{"type": "semi_final", "division": "girls", "team1_placeholder": "Winner M116", "team2_placeholder": "Winner M123"}')
  ON CONFLICT (tournament_id, round, match_number) DO NOTHING;
  
  -- Boys Semi Finals
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
  (tournament_uuid, 3, 126, NULL, NULL, '2025-08-07 09:20:00+08', 'SJKC YU HWA', 'pending', '{"type": "semi_final", "division": "boys", "team1_placeholder": "Winner LXA", "team2_placeholder": "Winner LXB"}'),
  (tournament_uuid, 3, 127, NULL, NULL, '2025-08-07 10:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "semi_final", "division": "boys", "team1_placeholder": "Winner LYA", "team2_placeholder": "Winner LYB"}')
  ON CONFLICT (tournament_id, round, match_number) DO NOTHING;
  
  -- Finals
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
  (tournament_uuid, 4, 128, NULL, NULL, '2025-08-07 11:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "final", "division": "girls", "team1_placeholder": "Winner M124", "team2_placeholder": "Winner M125"}'),
  (tournament_uuid, 4, 129, NULL, NULL, '2025-08-07 12:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "final", "division": "boys", "team1_placeholder": "Winner M126", "team2_placeholder": "Winner M127"}')
  ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

END $$;

-- Verify the final count
SELECT 
    COUNT(*) as total_matches,
    COUNT(CASE WHEN round = 1 THEN 1 END) as group_stage_matches,
    COUNT(CASE WHEN round = 2 THEN 1 END) as second_round_matches,
    COUNT(CASE WHEN round = 3 THEN 1 END) as semi_final_matches,
    COUNT(CASE WHEN round = 4 THEN 1 END) as final_matches
FROM tournament_matches
WHERE tournament_id = '66666666-6666-6666-6666-666666666666';