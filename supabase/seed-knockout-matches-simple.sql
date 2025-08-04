-- MSS Melaka 2025 Basketball Tournament - Knockout Stage Matches (Simplified)
-- Run this script in Supabase SQL Editor

-- First, create placeholder teams for knockout stage
-- Boys placeholders
INSERT INTO tournament_teams (id, tournament_id, team_name, division, pool, metadata)
VALUES 
  -- Group winners
  ('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Winner Group LA', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LA", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-111111111112', '66666666-6666-6666-6666-666666666666', 'Winner Group LB', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LB", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-111111111113', '66666666-6666-6666-6666-666666666666', 'Winner Group LC', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LC", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-111111111114', '66666666-6666-6666-6666-666666666666', 'Winner Group LD', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LD", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-111111111115', '66666666-6666-6666-6666-666666666666', 'Winner Group LE', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LE", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-111111111116', '66666666-6666-6666-6666-666666666666', 'Winner Group LF', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LF", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-111111111117', '66666666-6666-6666-6666-666666666666', 'Winner Group LG', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LG", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-111111111118', '66666666-6666-6666-6666-666666666666', 'Winner Group LH', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LH", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-111111111119', '66666666-6666-6666-6666-666666666666', 'Winner Group LI', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LI", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-11111111111a', '66666666-6666-6666-6666-666666666666', 'Winner Group LJ', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LJ", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-11111111111b', '66666666-6666-6666-6666-666666666666', 'Winner Group LK', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LK", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-11111111111c', '66666666-6666-6666-6666-666666666666', 'Winner Group LL', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LL", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-11111111111d', '66666666-6666-6666-6666-666666666666', 'Winner Group LM', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LM", "type": "group_winner"}'),
  ('11111111-1111-1111-1111-11111111111e', '66666666-6666-6666-6666-666666666666', 'Winner Group LN', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LN", "type": "group_winner"}'),
  -- Second round winners
  ('11111111-1111-1111-1111-11111111111f', '66666666-6666-6666-6666-666666666666', 'Winner LXA', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LXA", "type": "second_round_winner"}'),
  ('11111111-1111-1111-1111-111111111120', '66666666-6666-6666-6666-666666666666', 'Winner LXB', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LXB", "type": "second_round_winner"}'),
  ('11111111-1111-1111-1111-111111111121', '66666666-6666-6666-6666-666666666666', 'Winner LYA', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LYA", "type": "second_round_winner"}'),
  ('11111111-1111-1111-1111-111111111122', '66666666-6666-6666-6666-666666666666', 'Winner LYB', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "LYB", "type": "second_round_winner"}'),
  -- Semi-final winners
  ('11111111-1111-1111-1111-111111111123', '66666666-6666-6666-6666-666666666666', 'Winner LSF1', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_match": "LSF1", "type": "semi_final_winner"}'),
  ('11111111-1111-1111-1111-111111111124', '66666666-6666-6666-6666-666666666666', 'Winner LSF2', 'boys', 'KNOCKOUT', '{"is_placeholder": true, "source_match": "LSF2", "type": "semi_final_winner"}')
ON CONFLICT (id) DO NOTHING;

-- Girls placeholders
INSERT INTO tournament_teams (id, tournament_id, team_name, division, pool, metadata)
VALUES 
  -- Group champions
  ('22222222-2222-2222-2222-222222222221', '66666666-6666-6666-6666-666666666666', 'Champion PA', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "PA", "type": "group_champion"}'),
  ('22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'Champion PB', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "PB", "type": "group_champion"}'),
  ('22222222-2222-2222-2222-222222222223', '66666666-6666-6666-6666-666666666666', 'Champion PC', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "PC", "type": "group_champion"}'),
  ('22222222-2222-2222-2222-222222222224', '66666666-6666-6666-6666-666666666666', 'Champion PD', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "PD", "type": "group_champion"}'),
  ('22222222-2222-2222-2222-222222222225', '66666666-6666-6666-6666-666666666666', 'Champion PE', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "PE", "type": "group_champion"}'),
  ('22222222-2222-2222-2222-222222222226', '66666666-6666-6666-6666-666666666666', 'Champion PF', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "PF", "type": "group_champion"}'),
  ('22222222-2222-2222-2222-222222222227', '66666666-6666-6666-6666-666666666666', 'Champion PG', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "PG", "type": "group_champion"}'),
  ('22222222-2222-2222-2222-222222222228', '66666666-6666-6666-6666-666666666666', 'Champion PH', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_group": "PH", "type": "group_champion"}'),
  -- Quarter-final winners
  ('22222222-2222-2222-2222-222222222229', '66666666-6666-6666-6666-666666666666', 'Winner PQF1', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_match": "PQF1", "type": "quarter_final_winner"}'),
  ('22222222-2222-2222-2222-22222222222a', '66666666-6666-6666-6666-666666666666', 'Winner PQF2', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_match": "PQF2", "type": "quarter_final_winner"}'),
  ('22222222-2222-2222-2222-22222222222b', '66666666-6666-6666-6666-666666666666', 'Winner PQF3', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_match": "PQF3", "type": "quarter_final_winner"}'),
  ('22222222-2222-2222-2222-22222222222c', '66666666-6666-6666-6666-666666666666', 'Winner PQF4', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_match": "PQF4", "type": "quarter_final_winner"}'),
  -- Semi-final winners
  ('22222222-2222-2222-2222-22222222222d', '66666666-6666-6666-6666-666666666666', 'Winner PSF1', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_match": "PSF1", "type": "semi_final_winner"}'),
  ('22222222-2222-2222-2222-22222222222e', '66666666-6666-6666-6666-666666666666', 'Winner PSF2', 'girls', 'KNOCKOUT', '{"is_placeholder": true, "source_match": "PSF2", "type": "semi_final_winner"}')
ON CONFLICT (id) DO NOTHING;

-- Day 3: August 6, 2025 - Knockout Stage
-- Boys Second Round matches
INSERT INTO tournament_matches (
  id, tournament_id, match_number, round, 
  team1_id, team2_id, 
  scheduled_time, venue, status, metadata
) VALUES
  -- Group LXA matches
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 103, 2,
   '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111112',
   '2025-08-06 08:20:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LXA", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 110, 2,
   '11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111',
   '2025-08-06 10:40:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LXA", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 117, 2,
   '11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111113',
   '2025-08-06 13:00:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LXA", "division": "boys"}'),
  
  -- Group LXB matches
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 104, 2,
   '11111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111115',
   '2025-08-06 08:40:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LXB", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 105, 2,
   '11111111-1111-1111-1111-111111111116', '11111111-1111-1111-1111-111111111117',
   '2025-08-06 09:00:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LXB", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 111, 2,
   '11111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111116',
   '2025-08-06 11:00:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LXB", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 112, 2,
   '11111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111117',
   '2025-08-06 11:20:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LXB", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 118, 2,
   '11111111-1111-1111-1111-111111111117', '11111111-1111-1111-1111-111111111114',
   '2025-08-06 13:20:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LXB", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 119, 2,
   '11111111-1111-1111-1111-111111111116', '11111111-1111-1111-1111-111111111115',
   '2025-08-06 13:40:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LXB", "division": "boys"}'),
  
  -- Group LYA matches
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 106, 2,
   '11111111-1111-1111-1111-111111111118', '11111111-1111-1111-1111-111111111119',
   '2025-08-06 09:20:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LYA", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 107, 2,
   '11111111-1111-1111-1111-11111111111a', '11111111-1111-1111-1111-11111111111b',
   '2025-08-06 09:40:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LYA", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 113, 2,
   '11111111-1111-1111-1111-111111111118', '11111111-1111-1111-1111-11111111111a',
   '2025-08-06 11:40:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LYA", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 114, 2,
   '11111111-1111-1111-1111-111111111119', '11111111-1111-1111-1111-11111111111b',
   '2025-08-06 12:00:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LYA", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 120, 2,
   '11111111-1111-1111-1111-11111111111b', '11111111-1111-1111-1111-111111111118',
   '2025-08-06 14:00:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LYA", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 121, 2,
   '11111111-1111-1111-1111-11111111111a', '11111111-1111-1111-1111-111111111119',
   '2025-08-06 14:20:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LYA", "division": "boys"}'),
  
  -- Group LYB matches
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 108, 2,
   '11111111-1111-1111-1111-11111111111d', '11111111-1111-1111-1111-11111111111e',
   '2025-08-06 10:00:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LYB", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 115, 2,
   '11111111-1111-1111-1111-11111111111e', '11111111-1111-1111-1111-11111111111c',
   '2025-08-06 12:20:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LYB", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 122, 2,
   '11111111-1111-1111-1111-11111111111c', '11111111-1111-1111-1111-11111111111d',
   '2025-08-06 14:40:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "second_round", "group": "LYB", "division": "boys"}')
ON CONFLICT (id) DO NOTHING;

-- Girls Quarter Finals
INSERT INTO tournament_matches (
  id, tournament_id, match_number, round, 
  team1_id, team2_id, 
  scheduled_time, venue, status, metadata
) VALUES
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 102, 2,
   '22222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222',
   '2025-08-06 08:00:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "quarter_final", "match_code": "PQF1", "division": "girls"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 109, 2,
   '22222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222224',
   '2025-08-06 10:20:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "quarter_final", "match_code": "PQF2", "division": "girls"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 116, 2,
   '22222222-2222-2222-2222-222222222225', '22222222-2222-2222-2222-222222222226',
   '2025-08-06 12:40:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "quarter_final", "match_code": "PQF3", "division": "girls"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 123, 2,
   '22222222-2222-2222-2222-222222222227', '22222222-2222-2222-2222-222222222228',
   '2025-08-06 15:00:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "quarter_final", "match_code": "PQF4", "division": "girls"}')
ON CONFLICT (id) DO NOTHING;

-- Day 4: August 7, 2025 - Finals Day
-- Semi Finals
INSERT INTO tournament_matches (
  id, tournament_id, match_number, round, 
  team1_id, team2_id, 
  scheduled_time, venue, status, metadata
) VALUES
  -- Girls Semi Finals
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 124, 3,
   '22222222-2222-2222-2222-222222222229', '22222222-2222-2222-2222-22222222222a',
   '2025-08-07 08:00:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "semi_final", "match_code": "PSF1", "division": "girls"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 125, 3,
   '22222222-2222-2222-2222-22222222222b', '22222222-2222-2222-2222-22222222222c',
   '2025-08-07 08:40:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "semi_final", "match_code": "PSF2", "division": "girls"}'),
  
  -- Boys Semi Finals
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 126, 3,
   '11111111-1111-1111-1111-11111111111f', '11111111-1111-1111-1111-111111111120',
   '2025-08-07 09:20:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "semi_final", "match_code": "LSF1", "division": "boys"}'),
  
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 127, 3,
   '11111111-1111-1111-1111-111111111121', '11111111-1111-1111-1111-111111111122',
   '2025-08-07 10:00:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "semi_final", "match_code": "LSF2", "division": "boys"}')
ON CONFLICT (id) DO NOTHING;

-- Finals
INSERT INTO tournament_matches (
  id, tournament_id, match_number, round, 
  team1_id, team2_id, 
  scheduled_time, venue, status, metadata
) VALUES
  -- Girls Final
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 128, 4,
   '22222222-2222-2222-2222-22222222222d', '22222222-2222-2222-2222-22222222222e',
   '2025-08-07 11:00:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "final", "match_code": "P.FINAL", "division": "girls"}'),
  
  -- Boys Final
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 129, 4,
   '11111111-1111-1111-1111-111111111123', '11111111-1111-1111-1111-111111111124',
   '2025-08-07 12:00:00+08', 'SJKC YU HWA (Court A)', 'pending',
   '{"type": "final", "match_code": "L.FINAL", "division": "boys"}')
ON CONFLICT (id) DO NOTHING;

-- Verify the results
SELECT 
  CASE 
    WHEN scheduled_time::date = '2025-08-06' THEN 'Day 3 - Knockout'
    WHEN scheduled_time::date = '2025-08-07' THEN 'Day 4 - Finals'
  END as day,
  COUNT(*) as match_count
FROM tournament_matches 
WHERE tournament_id = '66666666-6666-6666-6666-666666666666'
  AND round >= 2
GROUP BY scheduled_time::date
ORDER BY scheduled_time::date;