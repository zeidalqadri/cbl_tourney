import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const results: any = {
    tables: {},
    counts: {},
    columns: {}
  }

  try {
    // Check tournament_teams
    const { data: teams, error: teamsError } = await supabase
      .from('tournament_teams')
      .select('*')
      .limit(1)
    
    if (teamsError) {
      results.tables.tournament_teams = { error: teamsError.message }
    } else {
      results.tables.tournament_teams = 'exists'
      if (teams?.[0]) {
        results.columns.tournament_teams = Object.keys(teams[0])
      }
    }

    // Check tournament_matches
    const { data: matches, error: matchesError } = await supabase
      .from('tournament_matches')
      .select('*')
      .limit(1)
    
    if (matchesError) {
      results.tables.tournament_matches = { error: matchesError.message }
    } else {
      results.tables.tournament_matches = 'exists'
      if (matches?.[0]) {
        results.columns.tournament_matches = Object.keys(matches[0])
      }
    }

    // Check tournament_progression
    const { data: progression, error: progressionError } = await supabase
      .from('tournament_progression')
      .select('*')
      .limit(1)
    
    if (progressionError) {
      results.tables.tournament_progression = { error: progressionError.message }
    } else {
      results.tables.tournament_progression = 'exists'
    }

    // Count teams
    const { count: teamCount } = await supabase
      .from('tournament_teams')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    
    results.counts.teams = teamCount || 0

    // Count matches
    const { count: matchCount } = await supabase
      .from('tournament_matches')
      .select('*', { count: 'exact', head: true })
      .eq('tournament_id', '66666666-6666-6666-6666-666666666666')
    
    results.counts.matches = matchCount || 0

    return NextResponse.json(results, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}