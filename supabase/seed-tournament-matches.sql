-- Create tournament matches for MSS Melaka 2025
DO $$
DECLARE
  tournament_uuid UUID := '66666666-6666-6666-6666-666666666666';
  team_record RECORD;
  match_num INTEGER := 1;
  
  -- Function to get team ID by name and division
  FUNCTION get_team_id(team_code TEXT, div TEXT) RETURNS UUID AS
  $func$
  DECLARE
    team_uuid UUID;
  BEGIN
    SELECT id INTO team_uuid 
    FROM tournament_teams 
    WHERE tournament_id = tournament_uuid 
      AND team_name = (
        CASE team_code
          -- Boys teams
          WHEN 'LA1' THEN 'MALIM'
          WHEN 'LA2' THEN 'TING HWA'
          WHEN 'LA3' THEN 'BERTAM ULU'
          WHEN 'LB1' THEN 'WEN HUA'
          WHEN 'LB2' THEN 'AYER KEROH'
          WHEN 'LB3' THEN 'SIANG LIN'
          WHEN 'LC1' THEN 'MASJID TANAH'
          WHEN 'LC2' THEN 'CHENG'
          WHEN 'LC3' THEN 'SHUH YEN'
          WHEN 'LD1' THEN 'PAYA MENGKUANG'
          WHEN 'LD2' THEN 'POH LAN'
          WHEN 'LD3' THEN 'PONDOK BATANG'
          WHEN 'LD4' THEN 'CHABAU'
          WHEN 'LE1' THEN 'PAY CHEE'
          WHEN 'LE2' THEN 'PING MING'
          WHEN 'LE3' THEN 'CHUNG HWA'
          WHEN 'LF1' THEN 'SG UDANG'
          WHEN 'LF2' THEN 'MACHAP UMBOO'
          WHEN 'LF3' THEN 'ALOR GAJAH'
          WHEN 'LG1' THEN 'PAY FONG 1'
          WHEN 'LG2' THEN 'KEH SENG'
          WHEN 'LG3' THEN 'PERMATANG PASIR'
          WHEN 'LH1' THEN 'CHUNG CHENG'
          WHEN 'LH2' THEN 'DURIAN TUNGGAL'
          WHEN 'LH3' THEN 'PEI MIN'
          WHEN 'LI1' THEN 'MERLIMAU'
          WHEN 'LI2' THEN 'JASIN'
          WHEN 'LI3' THEN 'EH HOCK'
          WHEN 'LJ1' THEN 'DURIAN DAUN'
          WHEN 'LJ2' THEN 'PAYA RUMPUT'
          WHEN 'LJ3' THEN 'TEHEL'
          WHEN 'LK1' THEN 'KUBU'
          WHEN 'LK2' THEN 'DURIAN TUNGGAL 2'
          WHEN 'LK3' THEN 'BUNGA RAYA'
          WHEN 'LL1' THEN 'RENDAH KG LAPAN'
          WHEN 'LL2' THEN 'TIANG DERAS'
          WHEN 'LL3' THEN 'BANDA KABA'
          WHEN 'LM1' THEN 'MELAKA PINDAH'
          WHEN 'LM2' THEN 'AIR BARUK'
          WHEN 'LM3' THEN 'PENGKALAN BALAK'
          WHEN 'LN1' THEN 'LENDU'
          WHEN 'LN2' THEN 'PAY FONG 2'
          WHEN 'LN3' THEN 'MALIM JAYA'
          -- Girls teams - reuse names with different division
          WHEN 'PA1' THEN 'PAY FONG 1'
          WHEN 'PA2' THEN 'BERTAM ULU'
          WHEN 'PA3' THEN 'SIANG LIN'
          WHEN 'PB1' THEN 'PING MING'
          WHEN 'PB2' THEN 'ALOR GAJAH'
          WHEN 'PB3' THEN 'TING HWA'
          WHEN 'PC1' THEN 'BANDA KABA'
          WHEN 'PC2' THEN 'PERMATANG PASIR'
          WHEN 'PC3' THEN 'KUBU'
          WHEN 'PD1' THEN 'PAY CHEE'
          WHEN 'PD2' THEN 'PAYA MENGKUANG'
          WHEN 'PD3' THEN 'LENDU'
          WHEN 'PD4' THEN 'AIR BARUK'
          WHEN 'PE1' THEN 'MASJID TANAH'
          WHEN 'PE2' THEN 'WEN HUA'
          WHEN 'PE3' THEN 'TANJUNG TUAN'
          WHEN 'PE4' THEN 'MACHAP UMBOO'
          WHEN 'PF1' THEN 'CHUNG HWA'
          WHEN 'PF2' THEN 'MELAKA PINDAH'
          WHEN 'PF3' THEN 'MALIM'
          WHEN 'PF4' THEN 'CHUNG CHENG'
          WHEN 'PG1' THEN 'PAY FONG 2'
          WHEN 'PG2' THEN 'AYER KEROH'
          WHEN 'PG3' THEN 'PEI MIN'
          WHEN 'PG4' THEN 'SG UDANG'
          WHEN 'PH1' THEN 'KEH SENG'
          WHEN 'PH2' THEN 'SHUH YEN'
          WHEN 'PH3' THEN 'PENGKALAN BALAK'
          WHEN 'PH4' THEN 'PAYA RUMPUT'
          WHEN 'PI1' THEN 'DURIAN TUNGGAL'
          WHEN 'PI2' THEN 'JASIN'
          WHEN 'PI3' THEN 'RENDAH KG LAPAN'
          WHEN 'PI4' THEN 'BUNGA RAYA'
          WHEN 'PJ1' THEN 'TEHEL'
          WHEN 'PJ2' THEN 'MERLIMAU'
          WHEN 'PJ3' THEN 'MALIM JAYA'
          WHEN 'PJ4' THEN 'DURIAN TUNGGAL 2'
        END
      )
      AND division = div
    LIMIT 1;
    RETURN team_uuid;
  END;
  $func$ LANGUAGE plpgsql;

BEGIN
  -- Insert Day 1 Boys matches at YU HWA
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 1, get_team_id('LH1', 'boys'), get_team_id('LH2', 'boys'), '2025-08-04 08:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 3, get_team_id('LJ2', 'boys'), get_team_id('LJ3', 'boys'), '2025-08-04 08:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 5, get_team_id('LK1', 'boys'), get_team_id('LK3', 'boys'), '2025-08-04 08:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 7, get_team_id('LI1', 'boys'), get_team_id('LI2', 'boys'), '2025-08-04 09:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 9, get_team_id('LH2', 'boys'), get_team_id('LH3', 'boys'), '2025-08-04 09:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 11, get_team_id('LJ3', 'boys'), get_team_id('LJ1', 'boys'), '2025-08-04 09:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 13, get_team_id('LK3', 'boys'), get_team_id('LK2', 'boys'), '2025-08-04 10:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 15, get_team_id('LI2', 'boys'), get_team_id('LI3', 'boys'), '2025-08-04 10:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 17, get_team_id('LH3', 'boys'), get_team_id('LH1', 'boys'), '2025-08-04 10:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 19, get_team_id('LJ1', 'boys'), get_team_id('LJ2', 'boys'), '2025-08-04 11:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 21, get_team_id('LK2', 'boys'), get_team_id('LK1', 'boys'), '2025-08-04 11:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 23, get_team_id('LI3', 'boys'), get_team_id('LI1', 'boys'), '2025-08-04 11:40:00+08', 'SJKC YU HWA', 'pending');

  -- Insert Day 1 Boys matches at MALIM  
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 2, get_team_id('LA1', 'boys'), get_team_id('LA2', 'boys'), '2025-08-04 08:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 4, get_team_id('LB1', 'boys'), get_team_id('LB2', 'boys'), '2025-08-04 08:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 6, get_team_id('LC2', 'boys'), get_team_id('LC3', 'boys'), '2025-08-04 08:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 8, get_team_id('LA2', 'boys'), get_team_id('LA3', 'boys'), '2025-08-04 09:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 10, get_team_id('LB2', 'boys'), get_team_id('LB3', 'boys'), '2025-08-04 09:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 12, get_team_id('LC3', 'boys'), get_team_id('LC1', 'boys'), '2025-08-04 09:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 14, get_team_id('LA3', 'boys'), get_team_id('LA1', 'boys'), '2025-08-04 10:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 16, get_team_id('LB3', 'boys'), get_team_id('LB1', 'boys'), '2025-08-04 10:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 18, get_team_id('LC1', 'boys'), get_team_id('LC2', 'boys'), '2025-08-04 10:40:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 20, get_team_id('LD1', 'boys'), get_team_id('LD2', 'boys'), '2025-08-04 11:00:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 22, get_team_id('LD3', 'boys'), get_team_id('LD4', 'boys'), '2025-08-04 11:20:00+08', 'SJKC MALIM', 'pending'),
  (tournament_uuid, 1, 24, get_team_id('LE1', 'boys'), get_team_id('LE2', 'boys'), '2025-08-04 11:40:00+08', 'SJKC MALIM', 'pending')
  ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

  -- Add more matches later for girls division and subsequent days
  -- This is just a sample to get started
  
  -- Insert Day 1 Girls matches at YU HWA
  INSERT INTO tournament_matches (tournament_id, round, match_number, team1_id, team2_id, scheduled_time, venue, status) VALUES
  (tournament_uuid, 1, 43, get_team_id('PH1', 'girls'), get_team_id('PH2', 'girls'), '2025-08-04 15:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 45, get_team_id('PH3', 'girls'), get_team_id('PH4', 'girls'), '2025-08-04 15:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 47, get_team_id('PI1', 'girls'), get_team_id('PI2', 'girls'), '2025-08-04 15:40:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 49, get_team_id('PI3', 'girls'), get_team_id('PI4', 'girls'), '2025-08-04 16:00:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 51, get_team_id('PJ1', 'girls'), get_team_id('PJ2', 'girls'), '2025-08-04 16:20:00+08', 'SJKC YU HWA', 'pending'),
  (tournament_uuid, 1, 53, get_team_id('PJ3', 'girls'), get_team_id('PJ4', 'girls'), '2025-08-04 16:40:00+08', 'SJKC YU HWA', 'pending')
  ON CONFLICT (tournament_id, round, match_number) DO NOTHING;

END $$;