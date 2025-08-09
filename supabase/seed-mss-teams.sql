-- Use the existing MSS Melaka 2025 tournament
DO $$
DECLARE
  tournament_uuid UUID := '66666666-6666-6666-6666-666666666666';
BEGIN
  -- Insert Boys Division Teams
  INSERT INTO tournament_teams (tournament_id, team_name, division, pool) VALUES
  -- Group LA
  (tournament_uuid, 'MALIM', 'boys', 'LA'),
  (tournament_uuid, 'TING HWA', 'boys', 'LA'),
  (tournament_uuid, 'BERTAM ULU', 'boys', 'LA'),
  -- Group LB
  (tournament_uuid, 'WEN HUA', 'boys', 'LB'),
  (tournament_uuid, 'AYER KEROH', 'boys', 'LB'),
  (tournament_uuid, 'SIANG LIN', 'boys', 'LB'),
  -- Group LC
  (tournament_uuid, 'MASJID TANAH', 'boys', 'LC'),
  (tournament_uuid, 'CHENG', 'boys', 'LC'),
  (tournament_uuid, 'SHUH YEN', 'boys', 'LC'),
  -- Group LD
  (tournament_uuid, 'PAYA MENGKUANG', 'boys', 'LD'),
  (tournament_uuid, 'POH LAN', 'boys', 'LD'),
  (tournament_uuid, 'PONDOK BATANG', 'boys', 'LD'),
  (tournament_uuid, 'CHABAU', 'boys', 'LD'),
  -- Group LE
  (tournament_uuid, 'PAY CHEE', 'boys', 'LE'),
  (tournament_uuid, 'PING MING', 'boys', 'LE'),
  (tournament_uuid, 'CHUNG HWA', 'boys', 'LE'),
  -- Group LF
  (tournament_uuid, 'SG UDANG', 'boys', 'LF'),
  (tournament_uuid, 'MACHAP UMBOO', 'boys', 'LF'),
  (tournament_uuid, 'ALOR GAJAH', 'boys', 'LF'),
  -- Group LG
  (tournament_uuid, 'PAY FONG 1', 'boys', 'LG'),
  (tournament_uuid, 'KEH SENG', 'boys', 'LG'),
  (tournament_uuid, 'PERMATANG PASIR', 'boys', 'LG'),
  -- Group LH
  (tournament_uuid, 'CHUNG CHENG', 'boys', 'LH'),
  (tournament_uuid, 'DURIAN TUNGGAL', 'boys', 'LH'),
  (tournament_uuid, 'PEI MIN', 'boys', 'LH'),
  -- Group LI
  (tournament_uuid, 'MERLIMAU', 'boys', 'LI'),
  (tournament_uuid, 'JASIN', 'boys', 'LI'),
  (tournament_uuid, 'EH HOCK', 'boys', 'LI'),
  -- Group LJ
  (tournament_uuid, 'DURIAN DAUN', 'boys', 'LJ'),
  (tournament_uuid, 'PAYA RUMPUT', 'boys', 'LJ'),
  (tournament_uuid, 'TEHEL', 'boys', 'LJ'),
  -- Group LK
  (tournament_uuid, 'KUBU', 'boys', 'LK'),
  (tournament_uuid, 'DURIAN TUNGGAL 2', 'boys', 'LK'),
  (tournament_uuid, 'BUNGA RAYA', 'boys', 'LK'),
  -- Group LL
  (tournament_uuid, 'RENDAH KG LAPAN', 'boys', 'LL'),
  (tournament_uuid, 'TIANG DERAS', 'boys', 'LL'),
  (tournament_uuid, 'BANDA KABA', 'boys', 'LL'),
  -- Group LM
  (tournament_uuid, 'MELAKA PINDAH', 'boys', 'LM'),
  (tournament_uuid, 'AIR BARUK', 'boys', 'LM'),
  (tournament_uuid, 'PENGKALAN BALAK', 'boys', 'LM'),
  -- Group LN
  (tournament_uuid, 'LENDU', 'boys', 'LN'),
  (tournament_uuid, 'PAY FONG 2', 'boys', 'LN'),
  (tournament_uuid, 'MALIM JAYA', 'boys', 'LN'),

  -- Insert Girls Division Teams  
  -- Group PA
  (tournament_uuid, 'PAY FONG 1', 'girls', 'PA'),
  (tournament_uuid, 'BERTAM ULU', 'girls', 'PA'),
  (tournament_uuid, 'SIANG LIN', 'girls', 'PA'),
  -- Group PB
  (tournament_uuid, 'PING MING', 'girls', 'PB'),
  (tournament_uuid, 'ALOR GAJAH', 'girls', 'PB'),
  (tournament_uuid, 'TING HWA', 'girls', 'PB'),
  -- Group PC
  (tournament_uuid, 'BANDA KABA', 'girls', 'PC'),
  (tournament_uuid, 'PERMATANG PASIR', 'girls', 'PC'),
  (tournament_uuid, 'KUBU', 'girls', 'PC'),
  -- Group PD
  (tournament_uuid, 'PAY CHEE', 'girls', 'PD'),
  (tournament_uuid, 'PAYA MENGKUANG', 'girls', 'PD'),
  (tournament_uuid, 'LENDU', 'girls', 'PD'),
  (tournament_uuid, 'AIR BARUK', 'girls', 'PD'),
  -- Group PE
  (tournament_uuid, 'MASJID TANAH', 'girls', 'PE'),
  (tournament_uuid, 'WEN HUA', 'girls', 'PE'),
  (tournament_uuid, 'TANJUNG TUAN', 'girls', 'PE'),
  (tournament_uuid, 'MACHAP UMBOO', 'girls', 'PE'),
  -- Group PF
  (tournament_uuid, 'CHUNG HWA', 'girls', 'PF'),
  (tournament_uuid, 'MELAKA PINDAH', 'girls', 'PF'),
  (tournament_uuid, 'MALIM', 'girls', 'PF'),
  (tournament_uuid, 'CHUNG CHENG', 'girls', 'PF'),
  -- Group PG
  (tournament_uuid, 'PAY FONG 2', 'girls', 'PG'),
  (tournament_uuid, 'AYER KEROH', 'girls', 'PG'),
  (tournament_uuid, 'PEI MIN', 'girls', 'PG'),
  (tournament_uuid, 'SG UDANG', 'girls', 'PG'),
  -- Group PH
  (tournament_uuid, 'KEH SENG', 'girls', 'PH'),
  (tournament_uuid, 'SHUH YEN', 'girls', 'PH'),
  (tournament_uuid, 'PENGKALAN BALAK', 'girls', 'PH'),
  (tournament_uuid, 'PAYA RUMPUT', 'girls', 'PH'),
  -- Group PI
  (tournament_uuid, 'DURIAN TUNGGAL', 'girls', 'PI'),
  (tournament_uuid, 'JASIN', 'girls', 'PI'),
  (tournament_uuid, 'RENDAH KG LAPAN', 'girls', 'PI'),
  (tournament_uuid, 'BUNGA RAYA', 'girls', 'PI'),
  -- Group PJ
  (tournament_uuid, 'TEHEL', 'girls', 'PJ'),
  (tournament_uuid, 'MERLIMAU', 'girls', 'PJ'),
  (tournament_uuid, 'MALIM JAYA', 'girls', 'PJ'),
  (tournament_uuid, 'DURIAN TUNGGAL 2', 'girls', 'PJ')
  ON CONFLICT (tournament_id, team_name) DO NOTHING;
END $$;