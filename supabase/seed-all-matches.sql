-- MSS Melaka 2025 Basketball Tournament - Complete Match Schedule
-- This script loads all 129 matches from the official tournament schedule

DO $$
DECLARE
  tournament_uuid UUID := '66666666-6666-6666-6666-666666666666';
  
  -- Function to get team ID by code and division
  FUNCTION get_team_by_code(team_code TEXT, div TEXT) RETURNS UUID AS
  $func$
  DECLARE
    team_uuid UUID;
    team_name TEXT;
  BEGIN
    -- Map team codes to actual team names
    team_name := CASE 
      -- Boys teams Group LA-LN
      WHEN team_code = 'LA1' AND div = 'boys' THEN 'MALIM'
      WHEN team_code = 'LA2' AND div = 'boys' THEN 'TING HWA'
      WHEN team_code = 'LA3' AND div = 'boys' THEN 'BERTAM ULU'
      WHEN team_code = 'LB1' AND div = 'boys' THEN 'WEN HUA'
      WHEN team_code = 'LB2' AND div = 'boys' THEN 'AYER KEROH'
      WHEN team_code = 'LB3' AND div = 'boys' THEN 'SIANG LIN'
      WHEN team_code = 'LC1' AND div = 'boys' THEN 'MASJID TANAH'
      WHEN team_code = 'LC2' AND div = 'boys' THEN 'CHENG'
      WHEN team_code = 'LC3' AND div = 'boys' THEN 'SHUH YEN'
      WHEN team_code = 'LD1' AND div = 'boys' THEN 'PAYA MENGKUANG'
      WHEN team_code = 'LD2' AND div = 'boys' THEN 'POH LAN'
      WHEN team_code = 'LD3' AND div = 'boys' THEN 'PONDOK BATANG'
      WHEN team_code = 'LD4' AND div = 'boys' THEN 'CHABAU'
      WHEN team_code = 'LE1' AND div = 'boys' THEN 'PAY CHEE'
      WHEN team_code = 'LE2' AND div = 'boys' THEN 'PING MING'
      WHEN team_code = 'LE3' AND div = 'boys' THEN 'CHUNG HWA'
      WHEN team_code = 'LF1' AND div = 'boys' THEN 'SG UDANG'
      WHEN team_code = 'LF2' AND div = 'boys' THEN 'MACHAP UMBOO'
      WHEN team_code = 'LF3' AND div = 'boys' THEN 'ALOR GAJAH'
      WHEN team_code = 'LG1' AND div = 'boys' THEN 'PAY FONG 1'
      WHEN team_code = 'LG2' AND div = 'boys' THEN 'KEH SENG'
      WHEN team_code = 'LG3' AND div = 'boys' THEN 'PERMATANG PASIR'
      
      -- Boys teams from PDF Groups LH-LN (corrected from actual PDF)
      WHEN team_code = 'LH1' AND div = 'boys' THEN 'CHUNG CHENG'
      WHEN team_code = 'LH2' AND div = 'boys' THEN 'DURIAN TUNGGAL'
      WHEN team_code = 'LH3' AND div = 'boys' THEN 'PEI MIN'
      WHEN team_code = 'LI1' AND div = 'boys' THEN 'MERLIMAU'
      WHEN team_code = 'LI2' AND div = 'boys' THEN 'JASIN'
      WHEN team_code = 'LI3' AND div = 'boys' THEN 'EH HOCK'
      WHEN team_code = 'LJ1' AND div = 'boys' THEN 'DURIAN DAUN'
      WHEN team_code = 'LJ2' AND div = 'boys' THEN 'PAYA RUMPUT'
      WHEN team_code = 'LJ3' AND div = 'boys' THEN 'TEHEL'
      WHEN team_code = 'LK1' AND div = 'boys' THEN 'KUBU'
      WHEN team_code = 'LK2' AND div = 'boys' THEN 'DURIAN TUNGGAL 2'
      WHEN team_code = 'LK3' AND div = 'boys' THEN 'BUNGA RAYA'
      WHEN team_code = 'LL1' AND div = 'boys' THEN 'RENDAH KG LAPAN'
      WHEN team_code = 'LL2' AND div = 'boys' THEN 'TIANG DERAS'
      WHEN team_code = 'LL3' AND div = 'boys' THEN 'BANDA KABA'
      WHEN team_code = 'LM1' AND div = 'boys' THEN 'MELAKA PINDAH'
      WHEN team_code = 'LM2' AND div = 'boys' THEN 'AIR BARUK'
      WHEN team_code = 'LM3' AND div = 'boys' THEN 'PENGKALAN BALAK'
      WHEN team_code = 'LN1' AND div = 'boys' THEN 'LENDU'
      WHEN team_code = 'LN2' AND div = 'boys' THEN 'PAY FONG 2'
      WHEN team_code = 'LN3' AND div = 'boys' THEN 'MALIM JAYA'
      
      -- Girls teams Group PA-PH (using actual team assignments from PDF)
      WHEN team_code = 'PA1' AND div = 'girls' THEN 'PAY FONG 1'
      WHEN team_code = 'PA2' AND div = 'girls' THEN 'BERTAM ULU'
      WHEN team_code = 'PA3' AND div = 'girls' THEN 'SIANG LIN'
      WHEN team_code = 'PA4' AND div = 'girls' THEN 'SG UDANG'
      WHEN team_code = 'PB1' AND div = 'girls' THEN 'PING MING'
      WHEN team_code = 'PB2' AND div = 'girls' THEN 'ALOR GAJAH'
      WHEN team_code = 'PB3' AND div = 'girls' THEN 'TING HWA'
      WHEN team_code = 'PB4' AND div = 'girls' THEN 'CHUNG HWA'
      WHEN team_code = 'PB5' AND div = 'girls' THEN 'KUANG YAH'
      WHEN team_code = 'PC1' AND div = 'girls' THEN 'BANDA KABA'
      WHEN team_code = 'PC2' AND div = 'girls' THEN 'PERMATANG PASIR'
      WHEN team_code = 'PC3' AND div = 'girls' THEN 'KUBU'
      WHEN team_code = 'PC4' AND div = 'girls' THEN 'NOTRE DAME'
      WHEN team_code = 'PD1' AND div = 'girls' THEN 'PAY CHEE'
      WHEN team_code = 'PD2' AND div = 'girls' THEN 'PAYA MENGKUANG'
      WHEN team_code = 'PD3' AND div = 'girls' THEN 'LENDU'
      WHEN team_code = 'PD4' AND div = 'girls' THEN 'AIR BARUK'
      WHEN team_code = 'PE1' AND div = 'girls' THEN 'MASJID TANAH'
      WHEN team_code = 'PE2' AND div = 'girls' THEN 'WEN HUA'
      WHEN team_code = 'PE3' AND div = 'girls' THEN 'TANJUNG TUAN'
      WHEN team_code = 'PE4' AND div = 'girls' THEN 'MACHAP UMBOO'
      WHEN team_code = 'PF1' AND div = 'girls' THEN 'CHUNG HWA'
      WHEN team_code = 'PF2' AND div = 'girls' THEN 'MELAKA PINDAH'
      WHEN team_code = 'PF3' AND div = 'girls' THEN 'MALIM'
      WHEN team_code = 'PF4' AND div = 'girls' THEN 'CHUNG CHENG'
      WHEN team_code = 'PG1' AND div = 'girls' THEN 'PAY FONG 2'
      WHEN team_code = 'PG2' AND div = 'girls' THEN 'AYER KEROH'
      WHEN team_code = 'PG3' AND div = 'girls' THEN 'PEI MIN'
      WHEN team_code = 'PG4' AND div = 'girls' THEN 'SG UDANG'
      WHEN team_code = 'PG5' AND div = 'girls' THEN 'POH LAN'
      WHEN team_code = 'PH1' AND div = 'girls' THEN 'KEH SENG'
      WHEN team_code = 'PH2' AND div = 'girls' THEN 'SHUH YEN'
      WHEN team_code = 'PH3' AND div = 'girls' THEN 'PENGKALAN BALAK'
      WHEN team_code = 'PH4' AND div = 'girls' THEN 'PAYA RUMPUT'
      ELSE NULL
    END;
    
    IF team_name IS NOT NULL THEN
      SELECT id INTO team_uuid 
      FROM tournament_teams 
      WHERE tournament_id = tournament_uuid 
        AND team_name = team_name
        AND division = div
      LIMIT 1;
    END IF;
    
    RETURN team_uuid;
  END;
  $func$ LANGUAGE plpgsql;

BEGIN
  -- Clear existing matches for this tournament
  DELETE FROM tournament_matches WHERE tournament_id = tournament_uuid;

  -- Day 1: August 4, 2025 - Boys Group Stage
  -- YU HWA (Gelanggang A) - Boys matches
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 1, get_team_by_code('LH1', 'boys'), get_team_by_code('LH2', 'boys'), '2025-08-04 08:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 3, get_team_by_code('LJ2', 'boys'), get_team_by_code('LJ3', 'boys'), '2025-08-04 08:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 5, get_team_by_code('LK1', 'boys'), get_team_by_code('LK3', 'boys'), '2025-08-04 08:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 7, get_team_by_code('LI1', 'boys'), get_team_by_code('LI2', 'boys'), '2025-08-04 09:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 9, get_team_by_code('LH2', 'boys'), get_team_by_code('LH3', 'boys'), '2025-08-04 09:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 11, get_team_by_code('LJ3', 'boys'), get_team_by_code('LJ1', 'boys'), '2025-08-04 09:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 13, get_team_by_code('LK3', 'boys'), get_team_by_code('LK2', 'boys'), '2025-08-04 10:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 15, get_team_by_code('LI2', 'boys'), get_team_by_code('LI3', 'boys'), '2025-08-04 10:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 17, get_team_by_code('LH3', 'boys'), get_team_by_code('LH1', 'boys'), '2025-08-04 10:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 19, get_team_by_code('LJ1', 'boys'), get_team_by_code('LJ2', 'boys'), '2025-08-04 11:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 21, get_team_by_code('LK2', 'boys'), get_team_by_code('LK1', 'boys'), '2025-08-04 11:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 23, get_team_by_code('LI3', 'boys'), get_team_by_code('LI1', 'boys'), '2025-08-04 11:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 25, get_team_by_code('LL1', 'boys'), get_team_by_code('LL2', 'boys'), '2025-08-04 12:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 27, get_team_by_code('LM1', 'boys'), get_team_by_code('LM2', 'boys'), '2025-08-04 12:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 29, get_team_by_code('LN1', 'boys'), get_team_by_code('LN2', 'boys'), '2025-08-04 12:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 31, get_team_by_code('LL2', 'boys'), get_team_by_code('LL3', 'boys'), '2025-08-04 13:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 33, get_team_by_code('LM2', 'boys'), get_team_by_code('LM3', 'boys'), '2025-08-04 13:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 35, get_team_by_code('LN2', 'boys'), get_team_by_code('LN3', 'boys'), '2025-08-04 13:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 37, get_team_by_code('LL3', 'boys'), get_team_by_code('LL1', 'boys'), '2025-08-04 14:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 39, get_team_by_code('LM3', 'boys'), get_team_by_code('LM1', 'boys'), '2025-08-04 14:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 41, get_team_by_code('LN3', 'boys'), get_team_by_code('LN1', 'boys'), '2025-08-04 14:40:00+08', 'SJKC YU HWA', 'pending');
  
  -- MALIM (Gelanggang B) - Boys matches
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 2, get_team_by_code('LA1', 'boys'), get_team_by_code('LA2', 'boys'), '2025-08-04 08:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 4, get_team_by_code('LB1', 'boys'), get_team_by_code('LB2', 'boys'), '2025-08-04 08:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 6, get_team_by_code('LC2', 'boys'), get_team_by_code('LC3', 'boys'), '2025-08-04 08:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 8, get_team_by_code('LA2', 'boys'), get_team_by_code('LA3', 'boys'), '2025-08-04 09:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 10, get_team_by_code('LB2', 'boys'), get_team_by_code('LB3', 'boys'), '2025-08-04 09:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 12, get_team_by_code('LC3', 'boys'), get_team_by_code('LC1', 'boys'), '2025-08-04 09:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 14, get_team_by_code('LA3', 'boys'), get_team_by_code('LA1', 'boys'), '2025-08-04 10:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 16, get_team_by_code('LB3', 'boys'), get_team_by_code('LB1', 'boys'), '2025-08-04 10:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 18, get_team_by_code('LC1', 'boys'), get_team_by_code('LC2', 'boys'), '2025-08-04 10:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 20, get_team_by_code('LD1', 'boys'), get_team_by_code('LD2', 'boys'), '2025-08-04 11:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 22, get_team_by_code('LD3', 'boys'), get_team_by_code('LD4', 'boys'), '2025-08-04 11:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 24, get_team_by_code('LE1', 'boys'), get_team_by_code('LE2', 'boys'), '2025-08-04 11:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 26, get_team_by_code('LF1', 'boys'), get_team_by_code('LF2', 'boys'), '2025-08-04 12:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 28, get_team_by_code('LG1', 'boys'), get_team_by_code('LG2', 'boys'), '2025-08-04 12:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 30, get_team_by_code('LD1', 'boys'), get_team_by_code('LD3', 'boys'), '2025-08-04 12:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 32, get_team_by_code('LD2', 'boys'), get_team_by_code('LD4', 'boys'), '2025-08-04 13:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 34, get_team_by_code('LE2', 'boys'), get_team_by_code('LE3', 'boys'), '2025-08-04 13:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 36, get_team_by_code('LF2', 'boys'), get_team_by_code('LF3', 'boys'), '2025-08-04 13:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 38, get_team_by_code('LG2', 'boys'), get_team_by_code('LG3', 'boys'), '2025-08-04 14:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 40, get_team_by_code('LD4', 'boys'), get_team_by_code('LD1', 'boys'), '2025-08-04 14:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 42, get_team_by_code('LD3', 'boys'), get_team_by_code('LD2', 'boys'), '2025-08-04 14:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 43, get_team_by_code('LE3', 'boys'), get_team_by_code('LE1', 'boys'), '2025-08-04 15:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 44, get_team_by_code('LF3', 'boys'), get_team_by_code('LF1', 'boys'), '2025-08-04 15:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 45, get_team_by_code('LG3', 'boys'), get_team_by_code('LG1', 'boys'), '2025-08-04 16:00:00+08', 'SJKC MALIM', 'pending');

  -- Day 2: August 5, 2025 - Girls Group Stage
  -- YU HWA (Gelanggang A) - Girls matches
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 46, get_team_by_code('PA1', 'girls'), get_team_by_code('PA2', 'girls'), '2025-08-05 08:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 48, get_team_by_code('PA3', 'girls'), get_team_by_code('PA4', 'girls'), '2025-08-05 08:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 50, get_team_by_code('PB1', 'girls'), get_team_by_code('PB4', 'girls'), '2025-08-05 08:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 52, get_team_by_code('PB2', 'girls'), get_team_by_code('PB3', 'girls'), '2025-08-05 09:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 54, get_team_by_code('PC1', 'girls'), get_team_by_code('PC2', 'girls'), '2025-08-05 09:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 56, get_team_by_code('PC3', 'girls'), get_team_by_code('PC4', 'girls'), '2025-08-05 09:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 58, get_team_by_code('PD1', 'girls'), get_team_by_code('PD2', 'girls'), '2025-08-05 10:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 60, get_team_by_code('PD3', 'girls'), get_team_by_code('PD4', 'girls'), '2025-08-05 10:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 62, get_team_by_code('PB4', 'girls'), get_team_by_code('PB5', 'girls'), '2025-08-05 10:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 64, get_team_by_code('PB3', 'girls'), get_team_by_code('PB1', 'girls'), '2025-08-05 11:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 66, get_team_by_code('PA1', 'girls'), get_team_by_code('PA3', 'girls'), '2025-08-05 11:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 68, get_team_by_code('PA2', 'girls'), get_team_by_code('PA4', 'girls'), '2025-08-05 11:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 70, get_team_by_code('PC1', 'girls'), get_team_by_code('PC3', 'girls'), '2025-08-05 12:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 72, get_team_by_code('PC2', 'girls'), get_team_by_code('PC4', 'girls'), '2025-08-05 12:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 74, get_team_by_code('PB5', 'girls'), get_team_by_code('PB3', 'girls'), '2025-08-05 12:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 76, get_team_by_code('PB1', 'girls'), get_team_by_code('PB2', 'girls'), '2025-08-05 13:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 78, get_team_by_code('PD1', 'girls'), get_team_by_code('PD3', 'girls'), '2025-08-05 13:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 80, get_team_by_code('PD2', 'girls'), get_team_by_code('PD4', 'girls'), '2025-08-05 13:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 82, get_team_by_code('PA4', 'girls'), get_team_by_code('PA1', 'girls'), '2025-08-05 14:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 84, get_team_by_code('PA3', 'girls'), get_team_by_code('PA2', 'girls'), '2025-08-05 14:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 86, get_team_by_code('PB2', 'girls'), get_team_by_code('PB5', 'girls'), '2025-08-05 14:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 88, get_team_by_code('PB3', 'girls'), get_team_by_code('PB4', 'girls'), '2025-08-05 15:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 90, get_team_by_code('PC4', 'girls'), get_team_by_code('PC1', 'girls'), '2025-08-05 15:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 92, get_team_by_code('PC3', 'girls'), get_team_by_code('PC2', 'girls'), '2025-08-05 15:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 94, get_team_by_code('PD4', 'girls'), get_team_by_code('PD1', 'girls'), '2025-08-05 16:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 96, get_team_by_code('PD3', 'girls'), get_team_by_code('PD2', 'girls'), '2025-08-05 16:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 98, get_team_by_code('PB4', 'girls'), get_team_by_code('PB2', 'girls'), '2025-08-05 16:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 100, get_team_by_code('PB5', 'girls'), get_team_by_code('PB1', 'girls'), '2025-08-05 17:00:00+08', 'SJKC YU HWA', 'pending');

  -- MALIM (Gelanggang B) - Girls matches
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 47, get_team_by_code('PE3', 'girls'), get_team_by_code('PE4', 'girls'), '2025-08-05 08:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 49, get_team_by_code('PE1', 'girls'), get_team_by_code('PE2', 'girls'), '2025-08-05 08:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 51, get_team_by_code('PG4', 'girls'), get_team_by_code('PG5', 'girls'), '2025-08-05 08:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 53, get_team_by_code('PG3', 'girls'), get_team_by_code('PG1', 'girls'), '2025-08-05 09:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 55, get_team_by_code('PF1', 'girls'), get_team_by_code('PF2', 'girls'), '2025-08-05 09:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 57, get_team_by_code('PF3', 'girls'), get_team_by_code('PF4', 'girls'), '2025-08-05 09:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 59, get_team_by_code('PH1', 'girls'), get_team_by_code('PH2', 'girls'), '2025-08-05 10:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 61, get_team_by_code('PH3', 'girls'), get_team_by_code('PH4', 'girls'), '2025-08-05 10:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 63, get_team_by_code('PG5', 'girls'), get_team_by_code('PG3', 'girls'), '2025-08-05 10:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 65, get_team_by_code('PG1', 'girls'), get_team_by_code('PG2', 'girls'), '2025-08-05 11:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 67, get_team_by_code('PE3', 'girls'), get_team_by_code('PE1', 'girls'), '2025-08-05 11:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 69, get_team_by_code('PE4', 'girls'), get_team_by_code('PE2', 'girls'), '2025-08-05 11:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 71, get_team_by_code('PF1', 'girls'), get_team_by_code('PF3', 'girls'), '2025-08-05 12:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 73, get_team_by_code('PF2', 'girls'), get_team_by_code('PF4', 'girls'), '2025-08-05 12:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 75, get_team_by_code('PG2', 'girls'), get_team_by_code('PG5', 'girls'), '2025-08-05 12:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 77, get_team_by_code('PG3', 'girls'), get_team_by_code('PG4', 'girls'), '2025-08-05 13:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 79, get_team_by_code('PH1', 'girls'), get_team_by_code('PH3', 'girls'), '2025-08-05 13:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 81, get_team_by_code('PH2', 'girls'), get_team_by_code('PH4', 'girls'), '2025-08-05 13:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 83, get_team_by_code('PE2', 'girls'), get_team_by_code('PE3', 'girls'), '2025-08-05 14:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 85, get_team_by_code('PE1', 'girls'), get_team_by_code('PE4', 'girls'), '2025-08-05 14:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 87, get_team_by_code('PG4', 'girls'), get_team_by_code('PG2', 'girls'), '2025-08-05 14:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 89, get_team_by_code('PG5', 'girls'), get_team_by_code('PG1', 'girls'), '2025-08-05 15:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 91, get_team_by_code('PF4', 'girls'), get_team_by_code('PF1', 'girls'), '2025-08-05 15:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 93, get_team_by_code('PF3', 'girls'), get_team_by_code('PF2', 'girls'), '2025-08-05 15:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 95, get_team_by_code('PH4', 'girls'), get_team_by_code('PH1', 'girls'), '2025-08-05 16:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 97, get_team_by_code('PH3', 'girls'), get_team_by_code('PH2', 'girls'), '2025-08-05 16:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 99, get_team_by_code('PG2', 'girls'), get_team_by_code('PG3', 'girls'), '2025-08-05 16:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 101, get_team_by_code('PG1', 'girls'), get_team_by_code('PG4', 'girls'), '2025-08-05 17:00:00+08', 'SJKC MALIM', 'pending');

  -- Day 3: August 6, 2025 - Second Round and Quarter Finals
  -- All matches at YU HWA
  -- Placeholder matches for knockout rounds (will be updated when group winners are determined)
  
  -- Girls Quarter Finals
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
  (tournament_uuid, 2, 102, NULL, NULL, '2025-08-06 08:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "quarter_final", "division": "girls", "team1_placeholder": "Winner PA", "team2_placeholder": "Winner PB"}'),
  (tournament_uuid, 2, 109, NULL, NULL, '2025-08-06 10:20:00+08', 'SJKC YU HWA', 'pending', '{"type": "quarter_final", "division": "girls", "team1_placeholder": "Winner PC", "team2_placeholder": "Winner PD"}'),
  (tournament_uuid, 2, 116, NULL, NULL, '2025-08-06 12:40:00+08', 'SJKC YU HWA', 'pending', '{"type": "quarter_final", "division": "girls", "team1_placeholder": "Winner PE", "team2_placeholder": "Winner PF"}'),
  (tournament_uuid, 2, 123, NULL, NULL, '2025-08-06 15:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "quarter_final", "division": "girls", "team1_placeholder": "Winner PG", "team2_placeholder": "Winner PH"}');
  
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
  (tournament_uuid, 2, 122, NULL, NULL, '2025-08-06 14:40:00+08', 'SJKC YU HWA', 'pending', '{"type": "second_round", "division": "boys", "group": "LYB", "team1_placeholder": "Winner LL", "team2_placeholder": "Winner LM"}');

  -- Day 4: August 7, 2025 - Semi Finals and Finals
  -- All matches at YU HWA
  
  -- Girls Semi Finals
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
  (tournament_uuid, 3, 124, NULL, NULL, '2025-08-07 08:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "semi_final", "division": "girls", "team1_placeholder": "Winner M102", "team2_placeholder": "Winner M109"}'),
  (tournament_uuid, 3, 125, NULL, NULL, '2025-08-07 08:40:00+08', 'SJKC YU HWA', 'pending', '{"type": "semi_final", "division": "girls", "team1_placeholder": "Winner M116", "team2_placeholder": "Winner M123"}');
  
  -- Boys Semi Finals
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
  (tournament_uuid, 3, 126, NULL, NULL, '2025-08-07 09:20:00+08', 'SJKC YU HWA', 'pending', '{"type": "semi_final", "division": "boys", "team1_placeholder": "Winner LXA", "team2_placeholder": "Winner LXB"}'),
  (tournament_uuid, 3, 127, NULL, NULL, '2025-08-07 10:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "semi_final", "division": "boys", "team1_placeholder": "Winner LYA", "team2_placeholder": "Winner LYB"}');
  
  -- Finals
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status, metadata) VALUES
  (tournament_uuid, 4, 128, NULL, NULL, '2025-08-07 11:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "final", "division": "girls", "team1_placeholder": "Winner M124", "team2_placeholder": "Winner M125"}'),
  (tournament_uuid, 4, 129, NULL, NULL, '2025-08-07 12:00:00+08', 'SJKC YU HWA', 'pending', '{"type": "final", "division": "boys", "team1_placeholder": "Winner M126", "team2_placeholder": "Winner M127"}');

END $$;

-- Create function to update bracket progression
CREATE OR REPLACE FUNCTION update_bracket_progression() 
RETURNS TRIGGER AS $$
DECLARE
  tournament_uuid UUID := '66666666-6666-6666-6666-666666666666';
BEGIN
  -- This function will be called when a match is completed
  -- It will update the next round matches with the winners
  -- Implementation will be added in the next step
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic bracket updates
DROP TRIGGER IF EXISTS update_bracket_on_match_complete ON tournament_matches;
CREATE TRIGGER update_bracket_on_match_complete
  AFTER UPDATE OF status ON tournament_matches
  FOR EACH ROW
  WHEN (OLD.status != 'completed' AND NEW.status = 'completed')
  EXECUTE FUNCTION update_bracket_progression();