-- Load remaining matches for MSS Melaka 2025 Tournament
-- We already have 24 matches, need to add the remaining 105 matches

-- Helper function to get team UUID by name and division
CREATE OR REPLACE FUNCTION get_team_uuid(team_name_param TEXT, div TEXT) 
RETURNS UUID AS $$
DECLARE
  team_uuid UUID;
BEGIN
  SELECT id INTO team_uuid 
  FROM tournament_teams 
  WHERE tournament_id = '66666666-6666-6666-6666-666666666666'
    AND team_name = team_name_param
    AND division = div
  LIMIT 1;
  
  RETURN team_uuid;
END;
$$ LANGUAGE plpgsql;

-- Insert remaining matches starting from match 25
-- Day 1: August 4, 2025 - Boys Group Stage (continuing from match 25)

-- YU HWA (Gelanggang A) - Boys matches
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
('66666666-6666-6666-6666-666666666666', 1, 25, get_team_uuid('RENDAH KG LAPAN', 'boys'), get_team_uuid('TIANG DERAS', 'boys'), '2025-08-04 12:00:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 27, get_team_uuid('MELAKA PINDAH', 'boys'), get_team_uuid('AIR BARUK', 'boys'), '2025-08-04 12:20:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 29, get_team_uuid('LENDU', 'boys'), get_team_uuid('PAY FONG 2', 'boys'), '2025-08-04 12:40:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 31, get_team_uuid('TIANG DERAS', 'boys'), get_team_uuid('BANDA KABA', 'boys'), '2025-08-04 13:00:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 33, get_team_uuid('AIR BARUK', 'boys'), get_team_uuid('PENGKALAN BALAK', 'boys'), '2025-08-04 13:20:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 35, get_team_uuid('PAY FONG 2', 'boys'), get_team_uuid('MALIM JAYA', 'boys'), '2025-08-04 13:40:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 37, get_team_uuid('BANDA KABA', 'boys'), get_team_uuid('RENDAH KG LAPAN', 'boys'), '2025-08-04 14:00:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 39, get_team_uuid('PENGKALAN BALAK', 'boys'), get_team_uuid('MELAKA PINDAH', 'boys'), '2025-08-04 14:20:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 41, get_team_uuid('MALIM JAYA', 'boys'), get_team_uuid('LENDU', 'boys'), '2025-08-04 14:40:00+08', 'SJKC YU HWA', 'pending')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- MALIM (Gelanggang B) - Boys matches (continuing)
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
('66666666-6666-6666-6666-666666666666', 1, 26, get_team_uuid('SG UDANG', 'boys'), get_team_uuid('MACHAP UMBOO', 'boys'), '2025-08-04 12:00:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 28, get_team_uuid('PAY FONG 1', 'boys'), get_team_uuid('KEH SENG', 'boys'), '2025-08-04 12:20:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 30, get_team_uuid('PAYA MENGKUANG', 'boys'), get_team_uuid('PONDOK BATANG', 'boys'), '2025-08-04 12:40:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 32, get_team_uuid('POH LAN', 'boys'), get_team_uuid('CHABAU', 'boys'), '2025-08-04 13:00:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 34, get_team_uuid('MACHAP UMBOO', 'boys'), get_team_uuid('DURIAN TUNGGAL', 'boys'), '2025-08-04 13:20:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 36, get_team_uuid('KEH SENG', 'boys'), get_team_uuid('DUYONG', 'boys'), '2025-08-04 13:40:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 38, get_team_uuid('PONDOK BATANG', 'boys'), get_team_uuid('AIR KEROH', 'boys'), '2025-08-04 14:00:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 40, get_team_uuid('CHABAU', 'boys'), get_team_uuid('MACHAP', 'boys'), '2025-08-04 14:20:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 42, get_team_uuid('DURIAN TUNGGAL', 'boys'), get_team_uuid('SG UDANG', 'boys'), '2025-08-04 14:40:00+08', 'SJKC MALIM', 'pending')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- Day 2: August 5, 2025 - Boys continue + Girls start

-- YU HWA (Gelanggang A) - Boys matches (continuing)
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
('66666666-6666-6666-6666-666666666666', 1, 43, get_team_uuid('DUYONG', 'boys'), get_team_uuid('PAY FONG 1', 'boys'), '2025-08-05 08:00:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 45, get_team_uuid('AIR KEROH', 'boys'), get_team_uuid('PAYA MENGKUANG', 'boys'), '2025-08-05 08:20:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 47, get_team_uuid('MACHAP', 'boys'), get_team_uuid('POH LAN', 'boys'), '2025-08-05 08:40:00+08', 'SJKC YU HWA', 'pending')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- YU HWA (Gelanggang A) - Girls matches (starting)
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
('66666666-6666-6666-6666-666666666666', 1, 49, get_team_uuid('RENDAH KG LAPAN', 'girls'), get_team_uuid('LENDU', 'girls'), '2025-08-05 09:00:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 51, get_team_uuid('PAY FONG 2', 'girls'), get_team_uuid('PONDOK BATANG', 'girls'), '2025-08-05 09:20:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 53, get_team_uuid('LENDU', 'girls'), get_team_uuid('BANDA KABA', 'girls'), '2025-08-05 09:40:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 55, get_team_uuid('PONDOK BATANG', 'girls'), get_team_uuid('MELAKA PINDAH', 'girls'), '2025-08-05 10:00:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 57, get_team_uuid('BANDA KABA', 'girls'), get_team_uuid('RENDAH KG LAPAN', 'girls'), '2025-08-05 10:20:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 59, get_team_uuid('MELAKA PINDAH', 'girls'), get_team_uuid('PAY FONG 2', 'girls'), '2025-08-05 10:40:00+08', 'SJKC YU HWA', 'pending')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- MALIM (Gelanggang B) - Girls matches
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
('66666666-6666-6666-6666-666666666666', 1, 44, get_team_uuid('SEMABOK', 'girls'), get_team_uuid('AIR KEROH', 'girls'), '2025-08-05 08:00:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 46, get_team_uuid('PAY FONG 1', 'girls'), get_team_uuid('PAYA MENGKUANG', 'girls'), '2025-08-05 08:20:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 48, get_team_uuid('AIR KEROH', 'girls'), get_team_uuid('SG UDANG', 'girls'), '2025-08-05 08:40:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 50, get_team_uuid('PAYA MENGKUANG', 'girls'), get_team_uuid('PENGKALAN BALAK', 'girls'), '2025-08-05 09:00:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 52, get_team_uuid('SG UDANG', 'girls'), get_team_uuid('SEMABOK', 'girls'), '2025-08-05 09:20:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 54, get_team_uuid('PENGKALAN BALAK', 'girls'), get_team_uuid('PAY FONG 1', 'girls'), '2025-08-05 09:40:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 56, get_team_uuid('TIANG DERAS', 'girls'), get_team_uuid('MACHAP UMBOO', 'girls'), '2025-08-05 10:00:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 58, get_team_uuid('CHABAU', 'girls'), get_team_uuid('MACHAP', 'girls'), '2025-08-05 10:20:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 60, get_team_uuid('MACHAP UMBOO', 'girls'), get_team_uuid('MALIM JAYA', 'girls'), '2025-08-05 10:40:00+08', 'SJKC MALIM', 'pending')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- Continue with remaining Girls group stage matches
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
('66666666-6666-6666-6666-666666666666', 1, 61, get_team_uuid('MACHAP', 'girls'), get_team_uuid('KEH SENG', 'girls'), '2025-08-05 11:00:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 63, get_team_uuid('MALIM JAYA', 'girls'), get_team_uuid('TIANG DERAS', 'girls'), '2025-08-05 11:20:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 65, get_team_uuid('KEH SENG', 'girls'), get_team_uuid('CHABAU', 'girls'), '2025-08-05 11:40:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 62, get_team_uuid('AIR BARUK', 'girls'), get_team_uuid('DURIAN TUNGGAL', 'girls'), '2025-08-05 11:00:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 64, get_team_uuid('POH LAN', 'girls'), get_team_uuid('DUYONG', 'girls'), '2025-08-05 11:20:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 66, get_team_uuid('DURIAN TUNGGAL', 'girls'), get_team_uuid('BANDA HILIR', 'girls'), '2025-08-05 11:40:00+08', 'SJKC MALIM', 'pending')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- Continue with more matches...
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
('66666666-6666-6666-6666-666666666666', 1, 67, get_team_uuid('DUYONG', 'girls'), get_team_uuid('YONG PENG', 'girls'), '2025-08-05 12:00:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 69, get_team_uuid('BANDA HILIR', 'girls'), get_team_uuid('AIR BARUK', 'girls'), '2025-08-05 12:20:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 71, get_team_uuid('YONG PENG', 'girls'), get_team_uuid('POH LAN', 'girls'), '2025-08-05 12:40:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 68, get_team_uuid('SIN HOCK', 'girls'), get_team_uuid('PU TIAN', 'girls'), '2025-08-05 12:00:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 70, get_team_uuid('PAYA RUMPUT', 'girls'), get_team_uuid('CHUNG WEI', 'girls'), '2025-08-05 12:20:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 72, get_team_uuid('PU TIAN', 'girls'), get_team_uuid('ANN TING', 'girls'), '2025-08-05 12:40:00+08', 'SJKC MALIM', 'pending')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- Continue with remaining group stage matches
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
('66666666-6666-6666-6666-666666666666', 1, 73, get_team_uuid('CHUNG WEI', 'girls'), get_team_uuid('CHUNG HWA', 'girls'), '2025-08-05 13:00:00+08', 'SJKC YU HWA', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 74, get_team_uuid('ANN TING', 'girls'), get_team_uuid('SIN HOCK', 'girls'), '2025-08-05 13:00:00+08', 'SJKC MALIM', 'pending'),
('66666666-6666-6666-6666-666666666666', 1, 75, get_team_uuid('CHUNG HWA', 'girls'), get_team_uuid('PAYA RUMPUT', 'girls'), '2025-08-05 13:20:00+08', 'SJKC YU HWA', 'pending')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- Boys Second Round Matches (August 6)
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
('66666666-6666-6666-6666-666666666666', 2, 76, NULL, NULL, '2025-08-06 08:00:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LA1", "placeholder_team2": "LD2", "description": "Second Round Group 1"}'),
('66666666-6666-6666-6666-666666666666', 2, 77, NULL, NULL, '2025-08-06 08:00:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LB1", "placeholder_team2": "LC2", "description": "Second Round Group 1"}'),
('66666666-6666-6666-6666-666666666666', 2, 78, NULL, NULL, '2025-08-06 08:20:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LE1", "placeholder_team2": "LH2", "description": "Second Round Group 2"}'),
('66666666-6666-6666-6666-666666666666', 2, 79, NULL, NULL, '2025-08-06 08:20:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LF1", "placeholder_team2": "LG2", "description": "Second Round Group 2"}'),
('66666666-6666-6666-6666-666666666666', 2, 80, NULL, NULL, '2025-08-06 08:40:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LI1", "placeholder_team2": "LL2", "description": "Second Round Group 3"}'),
('66666666-6666-6666-6666-666666666666', 2, 81, NULL, NULL, '2025-08-06 08:40:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LJ1", "placeholder_team2": "LK2", "description": "Second Round Group 3"}'),
('66666666-6666-6666-6666-666666666666', 2, 82, NULL, NULL, '2025-08-06 09:00:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LM1", "placeholder_team2": "LN2", "description": "Second Round Group 4"}'),
('66666666-6666-6666-6666-666666666666', 2, 83, NULL, NULL, '2025-08-06 09:00:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LM2", "placeholder_team2": "LN1", "description": "Second Round Group 4"}'),
('66666666-6666-6666-6666-666666666666', 2, 84, NULL, NULL, '2025-08-06 09:20:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LA2", "placeholder_team2": "LD1", "description": "Second Round Group 1"}'),
('66666666-6666-6666-6666-666666666666', 2, 85, NULL, NULL, '2025-08-06 09:20:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LB2", "placeholder_team2": "LC1", "description": "Second Round Group 1"}'),
('66666666-6666-6666-6666-666666666666', 2, 86, NULL, NULL, '2025-08-06 09:40:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LE2", "placeholder_team2": "LH1", "description": "Second Round Group 2"}'),
('66666666-6666-6666-6666-666666666666', 2, 87, NULL, NULL, '2025-08-06 09:40:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LF2", "placeholder_team2": "LG1", "description": "Second Round Group 2"}'),
('66666666-6666-6666-6666-666666666666', 2, 88, NULL, NULL, '2025-08-06 10:00:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LI2", "placeholder_team2": "LL1", "description": "Second Round Group 3"}'),
('66666666-6666-6666-6666-666666666666', 2, 89, NULL, NULL, '2025-08-06 10:00:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LJ2", "placeholder_team2": "LK1", "description": "Second Round Group 3"}'),
('66666666-6666-6666-6666-666666666666', 2, 90, NULL, NULL, '2025-08-06 10:20:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LC1", "placeholder_team2": "LD1", "description": "Second Round Group 1"}'),
('66666666-6666-6666-6666-666666666666', 2, 91, NULL, NULL, '2025-08-06 10:20:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LA1", "placeholder_team2": "LB1", "description": "Second Round Group 1"}'),
('66666666-6666-6666-6666-666666666666', 2, 92, NULL, NULL, '2025-08-06 10:40:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LG1", "placeholder_team2": "LH1", "description": "Second Round Group 2"}'),
('66666666-6666-6666-6666-666666666666', 2, 93, NULL, NULL, '2025-08-06 10:40:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LE1", "placeholder_team2": "LF1", "description": "Second Round Group 2"}'),
('66666666-6666-6666-6666-666666666666', 2, 94, NULL, NULL, '2025-08-06 11:00:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LK1", "placeholder_team2": "LL1", "description": "Second Round Group 3"}'),
('66666666-6666-6666-6666-666666666666', 2, 95, NULL, NULL, '2025-08-06 11:00:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LI1", "placeholder_team2": "LJ1", "description": "Second Round Group 3"}'),
('66666666-6666-6666-6666-666666666666', 2, 96, NULL, NULL, '2025-08-06 11:20:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LM1", "placeholder_team2": "LN1", "description": "Second Round Group 4"}'),
('66666666-6666-6666-6666-666666666666', 2, 97, NULL, NULL, '2025-08-06 11:20:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LM2", "placeholder_team2": "LN2", "description": "Second Round Group 4"}'),
('66666666-6666-6666-6666-666666666666', 2, 98, NULL, NULL, '2025-08-06 11:40:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LA1", "placeholder_team2": "LB2", "description": "Second Round Group 1"}'),
('66666666-6666-6666-6666-666666666666', 2, 99, NULL, NULL, '2025-08-06 11:40:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LC2", "placeholder_team2": "LD1", "description": "Second Round Group 1"}'),
('66666666-6666-6666-6666-666666666666', 2, 100, NULL, NULL, '2025-08-06 12:00:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LE1", "placeholder_team2": "LF2", "description": "Second Round Group 2"}'),
('66666666-6666-6666-6666-666666666666', 2, 101, NULL, NULL, '2025-08-06 12:00:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LG2", "placeholder_team2": "LH1", "description": "Second Round Group 2"}'),
('66666666-6666-6666-6666-666666666666', 2, 102, NULL, NULL, '2025-08-06 12:20:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LI1", "placeholder_team2": "LJ2", "description": "Second Round Group 3"}'),
('66666666-6666-6666-6666-666666666666', 2, 103, NULL, NULL, '2025-08-06 12:20:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LK2", "placeholder_team2": "LL1", "description": "Second Round Group 3"}'),
('66666666-6666-6666-6666-666666666666', 2, 104, NULL, NULL, '2025-08-06 12:40:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LC1", "placeholder_team2": "LD2", "description": "Second Round Group 1"}'),
('66666666-6666-6666-6666-666666666666', 2, 105, NULL, NULL, '2025-08-06 12:40:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LB1", "placeholder_team2": "LA2", "description": "Second Round Group 1"}'),
('66666666-6666-6666-6666-666666666666', 2, 106, NULL, NULL, '2025-08-06 13:00:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LG1", "placeholder_team2": "LH2", "description": "Second Round Group 2"}'),
('66666666-6666-6666-6666-666666666666', 2, 107, NULL, NULL, '2025-08-06 13:00:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LF1", "placeholder_team2": "LE2", "description": "Second Round Group 2"}'),
('66666666-6666-6666-6666-666666666666', 2, 108, NULL, NULL, '2025-08-06 13:20:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "LK1", "placeholder_team2": "LL2", "description": "Second Round Group 3"}'),
('66666666-6666-6666-6666-666666666666', 2, 109, NULL, NULL, '2025-08-06 13:20:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "LJ1", "placeholder_team2": "LI2", "description": "Second Round Group 3"}')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- Girls Quarter Finals (August 6)
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
('66666666-6666-6666-6666-666666666666', 3, 110, NULL, NULL, '2025-08-06 14:00:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "PA1", "placeholder_team2": "PH2", "description": "Girls Quarter Final 1"}'),
('66666666-6666-6666-6666-666666666666', 3, 111, NULL, NULL, '2025-08-06 14:00:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "PB1", "placeholder_team2": "PG2", "description": "Girls Quarter Final 2"}'),
('66666666-6666-6666-6666-666666666666', 3, 112, NULL, NULL, '2025-08-06 14:20:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "PC1", "placeholder_team2": "PF2", "description": "Girls Quarter Final 3"}'),
('66666666-6666-6666-6666-666666666666', 3, 113, NULL, NULL, '2025-08-06 14:20:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "PD1", "placeholder_team2": "PE2", "description": "Girls Quarter Final 4"}'),
('66666666-6666-6666-6666-666666666666', 3, 114, NULL, NULL, '2025-08-06 14:40:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "PE1", "placeholder_team2": "PD2", "description": "Girls Quarter Final 5"}'),
('66666666-6666-6666-6666-666666666666', 3, 115, NULL, NULL, '2025-08-06 14:40:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "PF1", "placeholder_team2": "PC2", "description": "Girls Quarter Final 6"}'),
('66666666-6666-6666-6666-666666666666', 3, 116, NULL, NULL, '2025-08-06 15:00:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "PG1", "placeholder_team2": "PB2", "description": "Girls Quarter Final 7"}'),
('66666666-6666-6666-6666-666666666666', 3, 117, NULL, NULL, '2025-08-06 15:00:00+08', 'SJKC MALIM', 'pending', '{"placeholder_team1": "PH1", "placeholder_team2": "PA2", "description": "Girls Quarter Final 8"}')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- Semi Finals (August 7)
-- Boys Semi Finals
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
('66666666-6666-6666-6666-666666666666', 4, 118, NULL, NULL, '2025-08-07 08:00:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "Second Round Group 1 Winner", "placeholder_team2": "Second Round Group 4 Winner", "description": "Boys Semi Final 1"}'),
('66666666-6666-6666-6666-666666666666', 4, 119, NULL, NULL, '2025-08-07 08:20:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "Second Round Group 2 Winner", "placeholder_team2": "Second Round Group 3 Winner", "description": "Boys Semi Final 2"}')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- Girls Semi Finals
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
('66666666-6666-6666-6666-666666666666', 4, 120, NULL, NULL, '2025-08-07 08:40:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "QF1 Winner", "placeholder_team2": "QF8 Winner", "description": "Girls Semi Final 1"}'),
('66666666-6666-6666-6666-666666666666', 4, 121, NULL, NULL, '2025-08-07 09:00:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "QF2 Winner", "placeholder_team2": "QF7 Winner", "description": "Girls Semi Final 2"}'),
('66666666-6666-6666-6666-666666666666', 4, 122, NULL, NULL, '2025-08-07 09:20:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "QF3 Winner", "placeholder_team2": "QF6 Winner", "description": "Girls Semi Final 3"}'),
('66666666-6666-6666-6666-666666666666', 4, 123, NULL, NULL, '2025-08-07 09:40:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "QF4 Winner", "placeholder_team2": "QF5 Winner", "description": "Girls Semi Final 4"}')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- 3rd/4th Place matches
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
('66666666-6666-6666-6666-666666666666', 5, 124, NULL, NULL, '2025-08-07 10:00:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "Boys SF1 Loser", "placeholder_team2": "Boys SF2 Loser", "description": "Boys 3rd/4th Place"}'),
('66666666-6666-6666-6666-666666666666', 5, 125, NULL, NULL, '2025-08-07 10:20:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "Girls SF1 Loser", "placeholder_team2": "Girls SF4 Loser", "description": "Girls 3rd/4th Place 1"}'),
('66666666-6666-6666-6666-666666666666', 5, 126, NULL, NULL, '2025-08-07 10:40:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "Girls SF2 Loser", "placeholder_team2": "Girls SF3 Loser", "description": "Girls 3rd/4th Place 2"}')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- Finals (August 7)
INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
('66666666-6666-6666-6666-666666666666', 5, 127, NULL, NULL, '2025-08-07 11:00:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "Boys SF1 Winner", "placeholder_team2": "Boys SF2 Winner", "description": "Boys Final"}'),
('66666666-6666-6666-6666-666666666666', 5, 128, NULL, NULL, '2025-08-07 11:20:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "Girls SF1 Winner", "placeholder_team2": "Girls SF4 Winner", "description": "Girls Final 1"}'),
('66666666-6666-6666-6666-666666666666', 5, 129, NULL, NULL, '2025-08-07 11:40:00+08', 'SJKC YU HWA', 'pending', '{"placeholder_team1": "Girls SF2 Winner", "placeholder_team2": "Girls SF3 Winner", "description": "Girls Final 2"}')
ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

-- Clean up the helper function
DROP FUNCTION IF EXISTS get_team_uuid(TEXT, TEXT);