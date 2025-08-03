import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DbTeam {
  id: string
  name: string
  group_name?: string
  division?: 'boys' | 'girls'
  emblem_url?: string
  created_at?: string
}

export interface DbMatch {
  id: string
  tournament_id?: string
  round?: number
  match_number?: number
  team1_id?: string
  team2_id?: string
  team1_score?: number
  team2_score?: number
  status?: string
  start_time?: string
  court?: string
  date?: string
  time?: string
  venue?: string
  division?: 'boys' | 'girls'
  created_at?: string
}

export interface DbTournamentTeam {
  id: string
  team_id?: string
  tournament_code?: string
  name: string
  group_name: string
  division: 'boys' | 'girls'
  emblem_url?: string
  created_at?: string
}

export interface DbTournamentMatch {
  id: string
  match_id?: string
  tournament_code?: string
  match_number: number
  date: string
  time: string
  venue: string
  division: 'boys' | 'girls'
  round: string
  team_a_id: string
  team_b_id: string
  score_a?: number
  score_b?: number
  status: 'scheduled' | 'in_progress' | 'completed'
  updated_at?: string
  created_at?: string
}

export interface DbResultCard {
  id: string
  match_id?: string
  tournament_match_id?: string
  image_url: string
  square_format_url: string
  landscape_format_url: string
  generated_at: string
}