import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Complete official schedule from PDF
const officialSchedule = [
  // Day 1 - 4 August 2025 - Boys Group Stage
  // Court A (SJKC YU HWA)
  { matchNum: 1, time: '08:00', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'YU HWA (B)', teamB: 'YU YING (B)', group: 'LH', division: 'boys' },
  { matchNum: 3, time: '08:20', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'ST MARY (B)', teamB: 'BACHANG (B)', group: 'LJ', division: 'boys' },
  { matchNum: 5, time: '08:40', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'PAY MIN (B)', teamB: 'SIN WAH (B)', group: 'LK', division: 'boys' },
  { matchNum: 7, time: '09:00', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'MERLIMAU (B)', teamB: 'CHIAO CHEE (B)', group: 'LI', division: 'boys' },
  { matchNum: 9, time: '09:20', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'YU YING (B)', teamB: 'TIANG DUA (B)', group: 'LH', division: 'boys' },
  { matchNum: 11, time: '09:40', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'BACHANG (B)', teamB: 'LENDU (B)', group: 'LJ', division: 'boys' },
  { matchNum: 13, time: '10:00', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'SIN WAH (B)', teamB: 'PAY CHIAO (B)', group: 'LK', division: 'boys' },
  { matchNum: 15, time: '10:20', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'CHIAO CHEE (B)', teamB: 'JASIN LALANG (B)', group: 'LI', division: 'boys' },
  { matchNum: 17, time: '10:40', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'TIANG DUA (B)', teamB: 'YU HWA (B)', group: 'LH', division: 'boys' },
  { matchNum: 19, time: '11:00', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'LENDU (B)', teamB: 'ST MARY (B)', group: 'LJ', division: 'boys' },
  { matchNum: 21, time: '11:20', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'PAY CHIAO (B)', teamB: 'PAY MIN (B)', group: 'LK', division: 'boys' },
  { matchNum: 23, time: '11:40', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'JASIN LALANG (B)', teamB: 'MERLIMAU (B)', group: 'LI', division: 'boys' },
  { matchNum: 25, time: '12:00', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'YU HSIEN (B)', teamB: 'PAY CHUIN (B)', group: 'LL', division: 'boys' },
  { matchNum: 27, time: '12:20', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'KIOW MIN (B)', teamB: 'PAY TECK (B)', group: 'LM', division: 'boys' },
  { matchNum: 29, time: '12:40', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'PAY FONG 2 (B)', teamB: 'PAY HWA (B)', group: 'LN', division: 'boys' },
  { matchNum: 31, time: '13:00', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'PAY CHUIN (B)', teamB: 'KATHOLIK (B)', group: 'LL', division: 'boys' },
  { matchNum: 33, time: '13:20', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'PAY TECK (B)', teamB: 'BKT BERUANG (B)', group: 'LM', division: 'boys' },
  { matchNum: 35, time: '13:40', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'PAY HWA (B)', teamB: 'KUANG YAH (B)', group: 'LN', division: 'boys' },
  { matchNum: 37, time: '14:00', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'KATHOLIK (B)', teamB: 'YU HSIEN (B)', group: 'LL', division: 'boys' },
  { matchNum: 39, time: '14:20', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'BKT BERUANG (B)', teamB: 'KIOW MIN (B)', group: 'LM', division: 'boys' },
  { matchNum: 41, time: '14:40', venue: 'SJKC YU HWA', date: '2025-08-04', teamA: 'KUANG YAH (B)', teamB: 'PAY FONG 2 (B)', group: 'LN', division: 'boys' },

  // Court B (SJKC MALIM)
  { matchNum: 2, time: '08:00', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'MALIM (B)', teamB: 'TING HWA (B)', group: 'LA', division: 'boys' },
  { matchNum: 4, time: '08:20', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'WEN HUA (B)', teamB: 'AYER KEROH (B)', group: 'LB', division: 'boys' },
  { matchNum: 6, time: '08:40', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'CHENG (B)', teamB: 'SHUH YEN (B)', group: 'LC', division: 'boys' },
  { matchNum: 8, time: '09:00', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'TING HWA (B)', teamB: 'BERTAM ULU (B)', group: 'LA', division: 'boys' },
  { matchNum: 10, time: '09:20', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'AYER KEROH (B)', teamB: 'SIANG LIN (B)', group: 'LB', division: 'boys' },
  { matchNum: 12, time: '09:40', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'SHUH YEN (B)', teamB: 'MASJID TANAH (B)', group: 'LC', division: 'boys' },
  { matchNum: 14, time: '10:00', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'BERTAM ULU (B)', teamB: 'MALIM (B)', group: 'LA', division: 'boys' },
  { matchNum: 16, time: '10:20', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'SIANG LIN (B)', teamB: 'WEN HUA (B)', group: 'LB', division: 'boys' },
  { matchNum: 18, time: '10:40', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'MASJID TANAH (B)', teamB: 'CHENG (B)', group: 'LC', division: 'boys' },
  { matchNum: 20, time: '11:00', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'PAYA MENGKUANG (B)', teamB: 'POH LAN (B)', group: 'LD', division: 'boys' },
  { matchNum: 22, time: '11:20', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'PONDOK BATANG (B)', teamB: 'CHABAU (B)', group: 'LD', division: 'boys' },
  { matchNum: 24, time: '11:40', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'PAY CHEE (B)', teamB: 'PING MING (B)', group: 'LE', division: 'boys' },
  { matchNum: 26, time: '12:00', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'SG UDANG (B)', teamB: 'MACHAP UMBOO (B)', group: 'LF', division: 'boys' },
  { matchNum: 28, time: '12:20', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'PAY FONG 1 (B)', teamB: 'KEH SENG (B)', group: 'LG', division: 'boys' },
  { matchNum: 30, time: '12:40', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'PAYA MENGKUANG (B)', teamB: 'PONDOK BATANG (B)', group: 'LD', division: 'boys' },
  { matchNum: 32, time: '13:00', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'POH LAN (B)', teamB: 'CHABAU (B)', group: 'LD', division: 'boys' },
  { matchNum: 34, time: '13:20', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'PING MING (B)', teamB: 'CHUNG HWA (B)', group: 'LE', division: 'boys' },
  { matchNum: 36, time: '13:40', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'MACHAP UMBOO (B)', teamB: 'ALOR GAJAH (B)', group: 'LF', division: 'boys' },
  { matchNum: 38, time: '14:00', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'KEH SENG (B)', teamB: 'MACHAP BARU (B)', group: 'LG', division: 'boys' },
  { matchNum: 40, time: '14:20', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'CHABAU (B)', teamB: 'PAYA MENGKUANG (B)', group: 'LD', division: 'boys' },
  { matchNum: 42, time: '14:40', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'PONDOK BATANG (B)', teamB: 'POH LAN (B)', group: 'LD', division: 'boys' },
  { matchNum: 43, time: '15:20', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'CHUNG HWA (B)', teamB: 'PAY CHEE (B)', group: 'LE', division: 'boys' },
  { matchNum: 44, time: '15:40', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'ALOR GAJAH (B)', teamB: 'SG UDANG (B)', group: 'LF', division: 'boys' },
  { matchNum: 45, time: '16:00', venue: 'SJKC MALIM', date: '2025-08-04', teamA: 'MACHAP BARU (B)', teamB: 'PAY FONG 1 (B)', group: 'LG', division: 'boys' },

  // Day 2 - 5 August 2025 - Girls Group Stage
  // Court A (SJKC YU HWA)
  { matchNum: 46, time: '08:00', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'YU HWA (G)', teamB: 'KEH SENG (G)', group: 'PA', division: 'girls' },
  { matchNum: 48, time: '08:20', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'PAY FONG 1 (G)', teamB: 'SG UDANG (G)', group: 'PA', division: 'girls' },
  { matchNum: 50, time: '08:40', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'PAY CHIAO (G)', teamB: 'PING MING (G)', group: 'PB', division: 'girls' },
  { matchNum: 52, time: '09:00', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'YU HSIEN (G)', teamB: 'CHUNG HWA (G)', group: 'PB', division: 'girls' },
  { matchNum: 54, time: '09:20', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'BKT BERUANG (G)', teamB: 'YU YING (G)', group: 'PC', division: 'girls' },
  { matchNum: 56, time: '09:40', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'PAY FONG 2 (G)', teamB: 'NOTRE DAME (G)', group: 'PC', division: 'girls' },
  { matchNum: 58, time: '10:00', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'CHABAU (G)', teamB: 'JASIN LALANG (G)', group: 'PD', division: 'girls' },
  { matchNum: 60, time: '10:20', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'YING CHYE (G)', teamB: 'PONDOK BATANG (G)', group: 'PD', division: 'girls' },
  { matchNum: 62, time: '10:40', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'PING MING (G)', teamB: 'KUANG YAH (G)', group: 'PB', division: 'girls' },
  { matchNum: 64, time: '11:00', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'CHUNG HWA (G)', teamB: 'PAY CHIAO (G)', group: 'PB', division: 'girls' },
  { matchNum: 66, time: '11:20', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'YU HWA (G)', teamB: 'PAY FONG 1 (G)', group: 'PA', division: 'girls' },
  { matchNum: 68, time: '11:40', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'KEH SENG (G)', teamB: 'SG UDANG (G)', group: 'PA', division: 'girls' },
  { matchNum: 70, time: '12:00', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'BKT BERUANG (G)', teamB: 'PAY FONG 2 (G)', group: 'PC', division: 'girls' },
  { matchNum: 72, time: '12:20', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'YU YING (G)', teamB: 'NOTRE DAME (G)', group: 'PC', division: 'girls' },
  { matchNum: 74, time: '12:40', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'KUANG YAH (G)', teamB: 'CHUNG HWA (G)', group: 'PB', division: 'girls' },
  { matchNum: 76, time: '13:00', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'PAY CHIAO (G)', teamB: 'YU HSIEN (G)', group: 'PB', division: 'girls' },
  { matchNum: 78, time: '13:20', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'CHABAU (G)', teamB: 'YING CHYE (G)', group: 'PD', division: 'girls' },
  { matchNum: 80, time: '13:40', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'JASIN LALANG (G)', teamB: 'PONDOK BATANG (G)', group: 'PD', division: 'girls' },
  { matchNum: 82, time: '14:00', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'SG UDANG (G)', teamB: 'YU HWA (G)', group: 'PA', division: 'girls' },
  { matchNum: 84, time: '14:20', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'PAY FONG 1 (G)', teamB: 'KEH SENG (G)', group: 'PA', division: 'girls' },
  { matchNum: 86, time: '14:40', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'YU HSIEN (G)', teamB: 'KUANG YAH (G)', group: 'PB', division: 'girls' },
  { matchNum: 88, time: '15:00', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'CHUNG HWA (G)', teamB: 'PING MING (G)', group: 'PB', division: 'girls' },
  { matchNum: 90, time: '15:20', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'NOTRE DAME (G)', teamB: 'BKT BERUANG (G)', group: 'PC', division: 'girls' },
  { matchNum: 92, time: '15:40', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'PAY FONG 2 (G)', teamB: 'YU YING (G)', group: 'PC', division: 'girls' },
  { matchNum: 94, time: '16:00', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'PONDOK BATANG (G)', teamB: 'CHABAU (G)', group: 'PD', division: 'girls' },
  { matchNum: 96, time: '16:20', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'YING CHYE (G)', teamB: 'JASIN LALANG (G)', group: 'PD', division: 'girls' },
  { matchNum: 98, time: '16:40', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'PING MING (G)', teamB: 'YU HSIEN (G)', group: 'PB', division: 'girls' },
  { matchNum: 100, time: '17:00', venue: 'SJKC YU HWA', date: '2025-08-05', teamA: 'KUANG YAH (G)', teamB: 'PAY CHIAO (G)', group: 'PB', division: 'girls' },

  // Court B (SJKC MALIM)
  { matchNum: 47, time: '08:00', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'PAY TECK (G)', teamB: 'WEN HUA (G)', group: 'PE', division: 'girls' },
  { matchNum: 49, time: '08:20', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'KIOW MIN (G)', teamB: 'SIN WAH (G)', group: 'PE', division: 'girls' },
  { matchNum: 51, time: '08:40', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'AYER KEROH (G)', teamB: 'POH LAN (G)', group: 'PG', division: 'girls' },
  { matchNum: 53, time: '09:00', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'PAY HWA (G)', teamB: 'MALIM (G)', group: 'PG', division: 'girls' },
  { matchNum: 55, time: '09:20', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'TIANG DUA (G)', teamB: 'PAY CHEE (G)', group: 'PF', division: 'girls' },
  { matchNum: 57, time: '09:40', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'KUANG HWA (G)', teamB: 'CHENG (G)', group: 'PF', division: 'girls' },
  { matchNum: 59, time: '10:00', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'CHIAO CHEE (G)', teamB: 'MERLIMAU (G)', group: 'PH', division: 'girls' },
  { matchNum: 61, time: '10:20', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'SHUH YEN (G)', teamB: 'MASJID TANAH (G)', group: 'PH', division: 'girls' },
  { matchNum: 63, time: '10:40', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'POH LAN (G)', teamB: 'PAY HWA (G)', group: 'PG', division: 'girls' },
  { matchNum: 65, time: '11:00', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'MALIM (G)', teamB: 'ALOR GAJAH (G)', group: 'PG', division: 'girls' },
  { matchNum: 67, time: '11:20', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'PAY TECK (G)', teamB: 'KIOW MIN (G)', group: 'PE', division: 'girls' },
  { matchNum: 69, time: '11:40', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'WEN HUA (G)', teamB: 'SIN WAH (G)', group: 'PE', division: 'girls' },
  { matchNum: 71, time: '12:00', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'TIANG DUA (G)', teamB: 'KUANG HWA (G)', group: 'PF', division: 'girls' },
  { matchNum: 73, time: '12:20', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'PAY CHEE (G)', teamB: 'CHENG (G)', group: 'PF', division: 'girls' },
  { matchNum: 75, time: '12:40', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'ALOR GAJAH (G)', teamB: 'POH LAN (G)', group: 'PG', division: 'girls' },
  { matchNum: 77, time: '13:00', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'PAY HWA (G)', teamB: 'AYER KEROH (G)', group: 'PG', division: 'girls' },
  { matchNum: 79, time: '13:20', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'CHIAO CHEE (G)', teamB: 'SHUH YEN (G)', group: 'PH', division: 'girls' },
  { matchNum: 81, time: '13:40', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'MERLIMAU (G)', teamB: 'MASJID TANAH (G)', group: 'PH', division: 'girls' },
  { matchNum: 83, time: '14:00', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'SIN WAH (G)', teamB: 'PAY TECK (G)', group: 'PE', division: 'girls' },
  { matchNum: 85, time: '14:20', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'KIOW MIN (G)', teamB: 'WEN HUA (G)', group: 'PE', division: 'girls' },
  { matchNum: 87, time: '14:40', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'AYER KEROH (G)', teamB: 'ALOR GAJAH (G)', group: 'PG', division: 'girls' },
  { matchNum: 89, time: '15:00', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'POH LAN (G)', teamB: 'MALIM (G)', group: 'PG', division: 'girls' },
  { matchNum: 91, time: '15:20', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'CHENG (G)', teamB: 'TIANG DUA (G)', group: 'PF', division: 'girls' },
  { matchNum: 93, time: '15:40', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'KUANG HWA (G)', teamB: 'PAY CHEE (G)', group: 'PF', division: 'girls' },
  { matchNum: 95, time: '16:00', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'MASJID TANAH (G)', teamB: 'CHIAO CHEE (G)', group: 'PH', division: 'girls' },
  { matchNum: 97, time: '16:20', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'SHUH YEN (G)', teamB: 'MERLIMAU (G)', group: 'PH', division: 'girls' },
  { matchNum: 99, time: '16:40', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'ALOR GAJAH (G)', teamB: 'PAY HWA (G)', group: 'PG', division: 'girls' },
  { matchNum: 101, time: '17:00', venue: 'SJKC MALIM', date: '2025-08-05', teamA: 'MALIM (G)', teamB: 'AYER KEROH (G)', group: 'PG', division: 'girls' },

  // Day 3 - 6 August 2025 - Mixed Knockout Stage
  { matchNum: 102, time: '08:00', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group PA', teamB: 'Winner Group PB', group: 'PQF1', division: 'girls' },
  { matchNum: 103, time: '08:20', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LB', teamB: 'Winner Group LC', group: 'LXA', division: 'boys' },
  { matchNum: 104, time: '08:40', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LD', teamB: 'Winner Group LE', group: 'LXB', division: 'boys' },
  { matchNum: 105, time: '09:00', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LF', teamB: 'Winner Group LG', group: 'LXB', division: 'boys' },
  { matchNum: 106, time: '09:20', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LH', teamB: 'Winner Group LI', group: 'LYA', division: 'boys' },
  { matchNum: 107, time: '09:40', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LJ', teamB: 'Winner Group LK', group: 'LYA', division: 'boys' },
  { matchNum: 108, time: '10:00', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LM', teamB: 'Winner Group LN', group: 'LYB', division: 'boys' },
  { matchNum: 109, time: '10:20', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group PC', teamB: 'Winner Group PD', group: 'PQF2', division: 'girls' },
  { matchNum: 110, time: '10:40', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LC', teamB: 'Winner Group LA', group: 'LXA', division: 'boys' },
  { matchNum: 111, time: '11:00', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LD', teamB: 'Winner Group LF', group: 'LXB', division: 'boys' },
  { matchNum: 112, time: '11:20', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LE', teamB: 'Winner Group LG', group: 'LXB', division: 'boys' },
  { matchNum: 113, time: '11:40', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LH', teamB: 'Winner Group LJ', group: 'LYA', division: 'boys' },
  { matchNum: 114, time: '12:00', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LI', teamB: 'Winner Group LK', group: 'LYA', division: 'boys' },
  { matchNum: 115, time: '12:20', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LN', teamB: 'Winner Group LL', group: 'LYB', division: 'boys' },
  { matchNum: 116, time: '12:40', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group PE', teamB: 'Winner Group PF', group: 'PQF3', division: 'girls' },
  { matchNum: 117, time: '13:00', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LA', teamB: 'Winner Group LB', group: 'LXA', division: 'boys' },
  { matchNum: 118, time: '13:20', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LG', teamB: 'Winner Group LD', group: 'LXB', division: 'boys' },
  { matchNum: 119, time: '13:40', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LF', teamB: 'Winner Group LE', group: 'LXB', division: 'boys' },
  { matchNum: 120, time: '14:00', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LK', teamB: 'Winner Group LH', group: 'LYA', division: 'boys' },
  { matchNum: 121, time: '14:20', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LJ', teamB: 'Winner Group LI', group: 'LYA', division: 'boys' },
  { matchNum: 122, time: '14:40', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group LL', teamB: 'Winner Group LM', group: 'LYB', division: 'boys' },
  { matchNum: 123, time: '13:00', venue: 'SJKC YU HWA', date: '2025-08-06', teamA: 'Winner Group PG', teamB: 'Winner Group PH', group: 'PQF4', division: 'girls' },

  // Day 4 - 7 August 2025 - Finals
  { matchNum: 124, time: '08:00', venue: 'SJKC YU HWA', date: '2025-08-07', teamA: 'Winner Game 102', teamB: 'Winner Game 109', group: 'PSF1', division: 'girls' },
  { matchNum: 125, time: '08:40', venue: 'SJKC YU HWA', date: '2025-08-07', teamA: 'Winner Game 116', teamB: 'Winner Game 123', group: 'PSF2', division: 'girls' },
  { matchNum: 126, time: '09:20', venue: 'SJKC YU HWA', date: '2025-08-07', teamA: 'Winner Group LXA', teamB: 'Winner Group LXB', group: 'LSF1', division: 'boys' },
  { matchNum: 127, time: '10:00', venue: 'SJKC YU HWA', date: '2025-08-07', teamA: 'Winner Group LYA', teamB: 'Winner Group LYB', group: 'LSF2', division: 'boys' },
  { matchNum: 128, time: '11:00', venue: 'SJKC YU HWA', date: '2025-08-07', teamA: 'Winner Game 124', teamB: 'Winner Game 125', group: 'P.FINAL', division: 'girls' },
  { matchNum: 129, time: '12:00', venue: 'SJKC YU HWA', date: '2025-08-07', teamA: 'Winner Game 126', teamB: 'Winner Game 127', group: 'L.FINAL', division: 'boys' }
]

async function fixCompleteSchedule() {
  try {
    console.log('🔄 Starting complete schedule fix...')
    
    // First, get all team IDs with their names
    console.log('📋 Fetching team data...')
    const { data: teams, error: teamsError } = await supabase
      .from('tournament_teams')
      .select('id, team_name')
    
    if (teamsError) throw teamsError
    
    const teamMap = new Map()
    teams.forEach(team => {
      teamMap.set(team.team_name, team.id)
    })
    
    console.log(`Found ${teams.length} teams in database`)
    
    // Create placeholder team for knockout rounds if not exists
    let placeholderTeamId = null
    const { data: existingPlaceholder } = await supabase
      .from('teams')
      .select('id')
      .eq('name', 'TBD')
      .single()
    
    if (existingPlaceholder) {
      placeholderTeamId = existingPlaceholder.id
    } else {
      const { data: newPlaceholder, error: placeholderError } = await supabase
        .from('teams')
        .insert({
          name: 'TBD',
          group_name: 'TBD',
          division: 'boys'
        })
        .select('id')
        .single()
      
      if (placeholderError) throw placeholderError
      placeholderTeamId = newPlaceholder.id
    }
    
    console.log(`Placeholder team ID: ${placeholderTeamId}`)
    
    // Delete all existing matches
    console.log('🗑️  Deleting all existing matches...')
    const { error: deleteError } = await supabase
      .from('tournament_matches')
      .delete()
      .gte('match_number', 1)
    
    if (deleteError) throw deleteError
    
    // Process and insert all matches from official schedule
    console.log('📝 Processing official schedule...')
    let successCount = 0
    let errorCount = 0
    const errors = []
    
    for (const match of officialSchedule) {
      try {
        // Handle placeholder teams for knockout rounds
        let teamAId = null
        let teamBId = null
        
        if (match.teamA.startsWith('Winner')) {
          // This is a placeholder for knockout rounds
          teamAId = placeholderTeamId
        } else {
          teamAId = teamMap.get(match.teamA)
          if (!teamAId) {
            console.warn(`⚠️  Team not found: ${match.teamA}`)
            continue
          }
        }
        
        if (match.teamB.startsWith('Winner')) {
          // This is a placeholder for knockout rounds
          teamBId = placeholderTeamId
        } else {
          teamBId = teamMap.get(match.teamB)
          if (!teamBId) {
            console.warn(`⚠️  Team not found: ${match.teamB}`)
            continue
          }
        }
        
        // Determine round based on group prefix and match number
        let round = 'group_stage'
        if (match.group.startsWith('PQF') || match.group.includes('QF')) {
          round = 'quarter_final'
        } else if (match.group.includes('SF')) {
          round = 'semi_final'
        } else if (match.group.includes('FINAL')) {
          round = 'final'
        } else if (match.group.startsWith('LX') || match.group.startsWith('LY')) {
          round = 'second_round'
        }
        
        // Create ISO datetime from date and time
        const scheduledTime = new Date(`${match.date}T${match.time}:00+08:00`).toISOString()
        
        const matchData = {
          tournament_id: '66666666-6666-6666-6666-666666666666',
          match_number: match.matchNum,
          scheduled_time: scheduledTime,
          venue: match.venue,
          court: match.venue,
          round: match.group.startsWith('L') ? 1 : (match.group.includes('QF') ? 3 : (match.group.includes('SF') ? 4 : (match.group.includes('FINAL') ? 5 : 2))),
          team1_id: teamAId,
          team2_id: teamBId,
          status: 'pending',
          metadata: {
            division: match.division,
            group: match.group,
            team1_placeholder: match.teamA.startsWith('Winner') ? match.teamA : null,
            team2_placeholder: match.teamB.startsWith('Winner') ? match.teamB : null
          }
        }
        
        const { error: insertError } = await supabase
          .from('tournament_matches')
          .insert(matchData)
        
        if (insertError) {
          errors.push(`Match ${match.matchNum}: ${insertError.message}`)
          errorCount++
        } else {
          successCount++
        }
        
      } catch (error) {
        errors.push(`Match ${match.matchNum}: ${error.message}`)
        errorCount++
      }
    }
    
    console.log(`\n✅ Complete schedule fix finished!`)
    console.log(`✅ Successfully inserted: ${successCount} matches`)
    console.log(`❌ Failed: ${errorCount} matches`)
    
    if (errors.length > 0) {
      console.log('\n📋 Errors encountered:')
      errors.forEach(error => console.log(`   ${error}`))
    }
    
    // Verify final count
    const { data: finalMatches, error: countError } = await supabase
      .from('tournament_matches')
      .select('match_number')
      .order('match_number')
    
    if (!countError) {
      console.log(`\n📊 Final verification: ${finalMatches.length} matches in database`)
      console.log(`📅 Match numbers: ${finalMatches[0]?.match_number} to ${finalMatches[finalMatches.length - 1]?.match_number}`)
    }
    
  } catch (error) {
    console.error('❌ Error fixing schedule:', error)
  }
}

// Run the fix
fixCompleteSchedule()