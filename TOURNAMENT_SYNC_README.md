# Tournament Data Sync - MSSN Melaka Basketball Championship 2025

## Overview
This document provides instructions for syncing the tournament data from the PDF results (KEPUTUSAN B12 5.8.2025.pdf) into the Supabase database.

## Data Summary
- **Boys Division (Lelaki B12)**: 14 groups (LA-LN), 52 teams, 101 matches
- **Girls Division (Perempuan B12)**: 8 groups (PA-PH), 32 teams, 101 matches
- **Total**: 202 completed matches with scores
- **Dates**: August 4-6, 2025

## Migration Files Created

### 1. Database Schema Updates
- `supabase/migrations/01-update-schema.sql`
  - Adds missing columns for tournament tracking
  - Creates views for group standings
  - Adds triggers for automatic statistics update

### 2. Match Data Sync
- `supabase/migrations/02-sync-boys-matches.sql`
  - All boys division group stage results
  - 45 matches with complete scores
  
- `supabase/migrations/03-sync-girls-matches.sql`
  - All girls division group stage results  
  - 101 matches with complete scores

### 3. Standings & Brackets
- `supabase/migrations/04-calculate-standings.sql`
  - Calculates group positions based on results
  - Marks qualified teams
  
- `supabase/migrations/05-create-knockout-brackets.sql`
  - Sets up second round groups for boys
  - Sets up quarter-finals for girls
  - Creates placeholder matches for semi-finals and finals

## How to Run the Sync

### Option 1: Using Node.js Scripts (Recommended for testing)

```bash
# 1. Check current database state
npm run check-db

# 2. Run the complete sync
npm run sync-tournament

# 3. Validate the sync was successful
npm run validate-tournament
```

### Option 2: Manual SQL Execution (Recommended for production)

1. Go to Supabase Dashboard > SQL Editor
2. Run each migration file in order:
   - First: `01-update-schema.sql`
   - Second: `02-sync-boys-matches.sql`
   - Third: `03-sync-girls-matches.sql`
   - Fourth: `04-calculate-standings.sql`
   - Fifth: `05-create-knockout-brackets.sql`

### Option 3: Using Supabase CLI

```bash
# Apply all migrations
supabase db push --db-url "your-database-url"
```

## Validation Checklist

After running the sync, verify:

✅ **Group Winners (Boys Division)**
- LA: MALIM
- LB: WEN HUA
- LC: CHENG
- LD: CHABAU
- LE: PAY CHEE
- LF: ALOR GAJAH
- LG: PAY FONG 1
- LH: YU HWA
- LI: MERLIMAU
- LJ: BACHANG
- LK: PAY CHIAO
- LL: YU HSIEN
- LM: BKT BERUANG
- LN: PAY FONG 2

✅ **Group Winners (Girls Division)**
- PA: KEH SENG
- PB: CHUNG HWA
- PC: BKT BERUANG
- PD: CHABAU
- PE: KIOW MIN
- PF: PAY CHEE
- PG: MALIM
- PH: CHIAO CHEE

✅ **Database Checks**
- [ ] All 202 matches have scores
- [ ] All group standings calculated correctly
- [ ] Qualified teams marked with `qualification_status = 'qualified'`
- [ ] Knockout brackets created with proper structure

## System Improvements Implemented

### 1. **Data Accuracy**
- Fixed inconsistent column naming
- Added proper tracking for multi-stage tournaments
- Implemented automatic statistics calculation

### 2. **Tournament Structure**
- Proper modeling of boys' second round groups (LXA, LXB, LYA, LYB)
- Clear differentiation between group stage and knockout rounds
- Automatic progression tracking

### 3. **Frontend Enhancements**
- Enhanced GroupStandings component with qualification indicators
- Improved TournamentBracket with proper round names
- Added visual distinction for qualified teams

### 4. **Data Validation**
- Validation script to check data integrity
- Cross-checking with PDF results
- Automatic winner verification

## Troubleshooting

### Issue: Migrations fail to run
**Solution**: Check database permissions and ensure you're using the service key

### Issue: Scores not updating
**Solution**: Ensure matches have proper team IDs and status is set to 'completed'

### Issue: Standings not calculating
**Solution**: Run the standings calculation script manually:
```sql
SELECT * FROM tournament_group_standings 
WHERE tournament_id = '66666666-6666-6666-6666-666666666666';
```

### Issue: Frontend not showing updates
**Solution**: 
1. Clear browser cache
2. Restart Next.js development server
3. Check Supabase real-time subscriptions

## Next Steps

1. **Verify Data**: Run `npm run validate-tournament` to ensure all data is correct
2. **Test Frontend**: Check that tournament brackets display correctly
3. **Monitor Knockout Stage**: As knockout matches are played, update scores accordingly
4. **Generate Result Cards**: Use the result card generation feature for completed matches

## Contact

For issues or questions about the sync process, check:
- Database logs in Supabase Dashboard
- Browser console for frontend errors
- Network tab for API response errors

## Important Notes

⚠️ **Before running in production**:
1. Backup your database
2. Test in a staging environment first
3. Verify all team names match exactly
4. Ensure no duplicate matches exist

✅ **Success Indicators**:
- All group standings show correct positions
- Qualified teams have green highlight
- Knockout brackets show correct matchups
- No console errors in frontend

---

Last Updated: August 6, 2025
Tournament: MSSN Melaka Basketball Championship 2025 (Under 12)