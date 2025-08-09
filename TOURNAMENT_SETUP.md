# MSS Melaka 2025 Basketball Tournament - Complete Setup Guide

## Overview

This document explains how to set up the complete MSS Melaka 2025 Basketball Tournament system with all 129 matches, automatic bracket progression, and real-time qualification tracking.

## Tournament Structure

### Boys Division (14 Groups → 4 Second Round Groups → Semi Finals → Final)
- **Group Stage**: 14 groups (LA-LN) with 3-4 teams each
- **Second Round**: 4 groups (LXA, LXB, LYA, LYB) with group winners
- **Semi Finals**: Winners of second round groups
- **Final**: Winners of semi finals

### Girls Division (10 Groups → Quarter Finals → Semi Finals → Final)
- **Group Stage**: 10 groups (PA-PJ) with 3-5 teams each  
- **Quarter Finals**: Direct knockout for group winners
- **Semi Finals**: Winners of quarter finals
- **Final**: Winners of semi finals

## Setup Instructions

### 1. Database Setup

Run the migrations and seed data:

```bash
# Option 1: Run the complete deployment script
./scripts/deploy-complete-tournament.sh

# Option 2: Run manually
# Run migrations
npx supabase db push

# Seed teams
npx supabase db push < supabase/seed-mss-teams.sql

# Seed all 129 matches
npx supabase db push < supabase/seed-all-matches.sql
```

### 2. Environment Variables

Ensure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tnglzpywvtafomngxsgc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_TOURNAMENT_ID=66666666-6666-6666-6666-666666666666
```

### 3. Deploy to Cloudflare Pages

```bash
# Build the project
npm run build

# Deploy
npx wrangler pages deploy .vercel/output/static --project-name=cbl-basketball-tracker
```

## Features Implemented

### 1. Complete Match Schedule
- All 129 matches from the official tournament schedule
- Proper venue assignments (SJKC YU HWA, SJKC MALIM)
- Correct dates and times (August 4-7, 2025)
- Automatic round classification

### 2. Bracket Progression
- Automatic advancement of group winners
- Dynamic bracket updates when matches complete
- Placeholder teams ("Winner Group X") until groups finish
- Support for complex boys tournament structure

### 3. Qualification Tracking
- Real-time qualification status (active/through/eliminated)
- Visual indicators in group standings
- Team progression history
- Current stage tracking

### 4. Enhanced UI Components
- **TournamentBracket**: Complete bracket visualization
- **GroupStandings**: Qualification indicators and status
- **MatchList**: All 129 matches with filtering
- **LiveScores**: Real-time score updates

### 5. Real-time Updates
- Match score changes trigger bracket updates
- Qualification status updates instantly
- Group completion automatically advances winners
- WebSocket subscriptions for live data

## Database Schema

### Key Tables
- `tournament_teams`: Teams with qualification status
- `tournament_matches`: All 129 matches with metadata
- `tournament_progression`: Team advancement history
- `group_standings`: View for real-time standings

### Progression Tracking
- `qualification_status`: active/through/eliminated
- `current_stage`: group_stage/second_round/quarter_final/semi_final/final
- `final_position`: Final tournament ranking

## Testing the System

### 1. Simulate Group Completion
Update match scores to complete a group:

```sql
-- Complete all Group LA matches (boys)
UPDATE tournament_matches 
SET score1 = 50, score2 = 40, status = 'completed'
WHERE tournament_id = '66666666-6666-6666-6666-666666666666'
  AND round = 1
  AND team1_id IN (SELECT id FROM tournament_teams WHERE pool = 'LA');
```

### 2. Verify Bracket Updates
- Check that group winner shows as "through"
- Verify second round match populated with winner
- Confirm real-time UI updates

### 3. Test Qualification Tracking
- View group standings to see qualification indicators
- Check team progression history
- Verify eliminated teams marked correctly

## Troubleshooting

### Missing Matches
If not all 129 matches appear:
1. Check Supabase logs for migration errors
2. Verify team mappings in `seed-all-matches.sql`
3. Ensure all teams exist before seeding matches

### Bracket Not Updating
If bracket doesn't update after match completion:
1. Check database triggers are created
2. Verify `update_bracket_progression()` function exists
3. Check browser console for WebSocket errors

### Qualification Status Issues
If qualification status not updating:
1. Verify `check_group_completion()` function
2. Check `tournament_progression` table for records
3. Ensure real-time subscriptions are active

## Future Enhancements

1. **Third Place Playoff**: Add 3rd/4th place matches
2. **Statistics Dashboard**: Team and player statistics
3. **Mobile App**: Native mobile experience
4. **Export Features**: Tournament reports and certificates
5. **Multi-language Support**: Malay/English toggle

## Support

For issues or questions:
- Check Supabase dashboard for database status
- Review browser console for client-side errors
- Check Cloudflare Pages logs for deployment issues

Tournament system built with Next.js, Supabase, and Tailwind CSS.