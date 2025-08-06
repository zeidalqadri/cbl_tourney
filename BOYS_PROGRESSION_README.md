# Boys Second Round Progression System

## Overview

The boys second round progression system automatically advances group winners to the semi-finals when all matches in their group are completed.

## Group Structure

### Groups
- **LXA** (3 teams): CHENG (B), MALIM (B), WEN HUA (B)
- **LXB** (3 teams): BKT BERUANG (B), PAY FONG 2 (B), YU HSIEN (B)
- **LYA** (4 teams): BACHANG (B), MERLIMAU (B), PAY CHIAO (B), YU HWA (B)
- **LYB** (4 teams): ALOR GAJAH (B), CHABAU (B), PAY CHEE (B), PAY FONG 1 (B)

### Match Allocation
- **LXA**: Matches #103, #110, #117 (3 matches for round-robin)
- **LXB**: Matches #108, #115, #122 (3 matches for round-robin)  
- **LYA**: Matches #106, #107, #113, #114, #120, #121 (6 matches for round-robin)
- **LYB**: Matches #104, #105, #111, #112, #118, #119 (6 matches for round-robin)

## Progression Flow

### Semi-Finals Assignment
- **Match #125**: LXA winner vs LXB winner
- **Match #127**: LYA winner vs LYB winner

### Group Winner Determination
Winners are determined by:
1. **Wins** (descending)
2. **Point differential** (descending)  
3. **Points for** (descending)

## Key Scripts

### `boys-group-standings.js`
Calculates current standings for all boys groups and identifies winners when groups complete.

```bash
node boys-group-standings.js
```

### `auto-populate-winners-enhanced.js` 
Enhanced auto-population script that handles both individual match progression and boys group progression.

```bash
# Run once
node auto-populate-winners-enhanced.js

# Monitor mode (continuous)
node auto-populate-winners-enhanced.js --monitor
```

### `update-boys-match-metadata.js`
Updates match metadata with group assignments and advancement links.

```bash
node update-boys-match-metadata.js
```

### `test-boys-progression.js`
Tests and simulates the progression system to verify it works correctly.

```bash
node test-boys-progression.js
```

## How It Works

### 1. Match Completion
When a boys second round match is completed:
- Score is updated
- Status changes to 'completed'
- Winner is determined

### 2. Group Monitoring
The system continuously monitors group completion:
- Counts completed vs total matches per group
- Calculates current standings
- Identifies when all group matches are done

### 3. Automatic Progression
When a group completes:
- Final standings are calculated
- Group winner is identified
- Winner is automatically placed in appropriate semi-final
- Semi-final match is updated in real-time

### 4. Database Structure
- Match metadata includes `group`, `advances_to`, `advances_to_position`
- `advances_to_match_id` links to the semi-final match
- Real-time subscriptions detect match completion

## Current Status

✅ All boys second round matches have proper metadata and advancement links
✅ Group standings calculation working correctly
✅ Auto-progression system ready and tested
✅ Semi-finals properly configured

## Example Flow

1. All LXA matches complete → CHENG (B) wins group
2. System detects group completion
3. CHENG (B) is automatically placed in Match #125 as team1
4. Semi-final bracket updates immediately
5. Same process repeats for other groups

## Integration

This system integrates seamlessly with the existing girls tournament progression, providing a unified auto-advancement system for the entire tournament.