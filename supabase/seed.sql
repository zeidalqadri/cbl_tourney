-- Insert Boys Division Teams
INSERT INTO teams (id, name, group_name, division) VALUES
-- Group LA
('LA1', 'MALIM', 'LA', 'boys'),
('LA2', 'TING HWA', 'LA', 'boys'),
('LA3', 'BERTAM ULU', 'LA', 'boys'),
-- Group LB
('LB1', 'WEN HUA', 'LB', 'boys'),
('LB2', 'AYER KEROH', 'LB', 'boys'),
('LB3', 'SIANG LIN', 'LB', 'boys'),
-- Group LC
('LC1', 'MASJID TANAH', 'LC', 'boys'),
('LC2', 'CHENG', 'LC', 'boys'),
('LC3', 'SHUH YEN', 'LC', 'boys'),
-- Group LD
('LD1', 'PAYA MENGKUANG', 'LD', 'boys'),
('LD2', 'POH LAN', 'LD', 'boys'),
('LD3', 'PONDOK BATANG', 'LD', 'boys'),
('LD4', 'CHABAU', 'LD', 'boys'),
-- Group LE
('LE1', 'PAY CHEE', 'LE', 'boys'),
('LE2', 'PING MING', 'LE', 'boys'),
('LE3', 'CHUNG HWA', 'LE', 'boys'),
-- Group LF
('LF1', 'SG UDANG', 'LF', 'boys'),
('LF2', 'MACHAP UMBOO', 'LF', 'boys'),
('LF3', 'ALOR GAJAH', 'LF', 'boys'),
-- Group LG
('LG1', 'PAY FONG 1', 'LG', 'boys'),
('LG2', 'KEH SENG', 'LG', 'boys'),
('LG3', 'MACHAP BARU', 'LG', 'boys'),
-- Group LH
('LH1', 'YU HWA', 'LH', 'boys'),
('LH2', 'YU YING', 'LH', 'boys'),
('LH3', 'TIANG DUA', 'LH', 'boys'),
-- Group LI
('LI1', 'MERLIMAU', 'LI', 'boys'),
('LI2', 'CHIAO CHEE', 'LI', 'boys'),
('LI3', 'JASIN LALANG', 'LI', 'boys'),
-- Group LJ
('LJ1', 'LENDU', 'LJ', 'boys'),
('LJ2', 'ST MARY', 'LJ', 'boys'),
('LJ3', 'BACHANG', 'LJ', 'boys'),
-- Group LK
('LK1', 'PAY MIN', 'LK', 'boys'),
('LK2', 'PAY CHIAO', 'LK', 'boys'),
('LK3', 'SIN WAH', 'LK', 'boys'),
-- Group LL
('LL1', 'YU HSIEN', 'LL', 'boys'),
('LL2', 'PAY CHUIN', 'LL', 'boys'),
('LL3', 'KATHOLIK', 'LL', 'boys'),
-- Group LM
('LM1', 'KIOW MIN', 'LM', 'boys'),
('LM2', 'PAY TECK', 'LM', 'boys'),
('LM3', 'BKT BERUANG', 'LM', 'boys'),
-- Group LN
('LN1', 'PAY FONG 2', 'LN', 'boys'),
('LN2', 'PAY HWA', 'LN', 'boys'),
('LN3', 'KUANG YAH', 'LN', 'boys');

-- Insert Girls Division Teams
INSERT INTO teams (id, name, group_name, division) VALUES
-- Group PA
('PA1', 'YU HWA', 'PA', 'girls'),
('PA2', 'KEH SENG', 'PA', 'girls'),
('PA3', 'PAY FONG 1', 'PA', 'girls'),
('PA4', 'SG UDANG', 'PA', 'girls'),
-- Group PB
('PB1', 'PAY CHIAO', 'PB', 'girls'),
('PB2', 'YU HSIEN', 'PB', 'girls'),
('PB3', 'CHUNG HWA', 'PB', 'girls'),
('PB4', 'PING MING', 'PB', 'girls'),
('PB5', 'KUANG YAH', 'PB', 'girls'),
-- Group PC
('PC1', 'BKT BERUANG', 'PC', 'girls'),
('PC2', 'YU YING', 'PC', 'girls'),
('PC3', 'PAY FONG 2', 'PC', 'girls'),
('PC4', 'NOTRE DAME', 'PC', 'girls'),
-- Group PD
('PD1', 'CHABAU', 'PD', 'girls'),
('PD2', 'JASIN LALANG', 'PD', 'girls'),
('PD3', 'YING CHYE', 'PD', 'girls'),
('PD4', 'PONDOK BATANG', 'PD', 'girls'),
-- Group PE
('PE1', 'KIOW MIN', 'PE', 'girls'),
('PE2', 'SIN WAH', 'PE', 'girls'),
('PE3', 'PAY TECK', 'PE', 'girls'),
('PE4', 'WEN HUA', 'PE', 'girls'),
-- Group PF
('PF1', 'TIANG DUA', 'PF', 'girls'),
('PF2', 'PAY CHEE', 'PF', 'girls'),
('PF3', 'KUANG HWA', 'PF', 'girls'),
('PF4', 'CHENG', 'PF', 'girls'),
-- Group PG
('PG1', 'MALIM', 'PG', 'girls'),
('PG2', 'ALOR GAJAH', 'PG', 'girls'),
('PG3', 'PAY HWA', 'PG', 'girls'),
('PG4', 'AYER KEROH', 'PG', 'girls'),
('PG5', 'POH LAN', 'PG', 'girls'),
-- Group PH
('PH1', 'CHIAO CHEE', 'PH', 'girls'),
('PH2', 'MERLIMAU', 'PH', 'girls'),
('PH3', 'SHUH YEN', 'PH', 'girls'),
('PH4', 'MASJID TANAH', 'PH', 'girls');

-- Insert first day matches (sample)
INSERT INTO matches (id, match_number, date, time, venue, division, round, team_a_id, team_b_id) VALUES
-- Boys matches at YU HWA
('M1', 1, '2025-08-04', '08:00', 'SJKC YU HWA', 'boys', 'Group Stage', 'LH1', 'LH2'),
('M3', 3, '2025-08-04', '08:20', 'SJKC YU HWA', 'boys', 'Group Stage', 'LJ2', 'LJ3'),
('M5', 5, '2025-08-04', '08:40', 'SJKC YU HWA', 'boys', 'Group Stage', 'LK1', 'LK3'),
('M7', 7, '2025-08-04', '09:00', 'SJKC YU HWA', 'boys', 'Group Stage', 'LI1', 'LI2'),
-- Boys matches at MALIM
('M2', 2, '2025-08-04', '08:00', 'SJKC MALIM', 'boys', 'Group Stage', 'LA1', 'LA2'),
('M4', 4, '2025-08-04', '08:20', 'SJKC MALIM', 'boys', 'Group Stage', 'LB1', 'LB2'),
('M6', 6, '2025-08-04', '08:40', 'SJKC MALIM', 'boys', 'Group Stage', 'LC2', 'LC3');