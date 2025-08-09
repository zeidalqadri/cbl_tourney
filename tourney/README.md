# MSS Melaka Basketball Tournament 2025 Reporting System

A comprehensive web-based tournament reporting system for the MSS Negeri Melaka 2025 U12 Basketball Tournament.

## Features

- **Real-time Score Updates**: Update match scores instantly with mobile-friendly forms
- **Automated Result Cards**: Generate social media-ready result cards in multiple formats
- **Dynamic Tournament Bracket**: Live bracket visualization that updates as matches complete
- **Multi-venue Support**: Handle matches across SJKC Yu Hwa and SJKC Malim simultaneously
- **Division Management**: Separate tracking for Boys (52 teams) and Girls (32 teams) divisions

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **Deployment**: Cloudflare Pages
- **Image Generation**: Canvas API for result cards

## Setup Instructions

### 1. Database Setup

1. Create a new Supabase project at https://supabase.com
2. Run the SQL scripts in order:
   ```sql
   -- Run schema.sql first to create tables
   -- Then run seed.sql to populate teams and initial matches
   ```

### 2. Environment Variables

Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### 4. Cloudflare Deployment

```bash
# Build for Cloudflare Pages
npm run pages:build

# Deploy to Cloudflare Pages
npm run pages:deploy

# Or use Cloudflare Dashboard:
# 1. Connect your GitHub repository
# 2. Set build command: npm run pages:build
# 3. Set output directory: .vercel/output/static
# 4. Add environment variables in Cloudflare dashboard
```

## Usage Guide

### Score Input
1. Navigate to the "Score Input" tab
2. Select a match from today's schedule
3. Enter scores for both teams
4. Submit to update the match and generate result card

### Tournament Bracket
- View real-time bracket progression
- Automatically updates as group winners are determined
- Shows path to finals for both divisions

### Admin Dashboard
- Access at `/admin`
- View all completed matches
- Generate/regenerate result cards
- Preview cards in different formats

## Tournament Structure

### Boys Division (52 teams)
- 14 groups (LA-LN) in first round
- Second round with 4 groups (LXA, LXB, LYA, LYB)
- Semi-finals and Finals

### Girls Division (32 teams)
- 8 groups (PA-PH) in first round
- Quarter-finals, Semi-finals, and Finals

## API Endpoints

- `GET /api/matches` - Fetch matches with filters
- `POST /api/matches/:id/score` - Update match score
- `POST /api/generate-result-card` - Generate result card for completed match

## Troubleshooting

### Supabase Connection Issues
- Verify your environment variables are correct
- Check Supabase project status
- Ensure Row Level Security policies are properly configured

### Cloudflare Deployment Issues
- Make sure you're using Node.js compatibility mode
- Check wrangler.toml configuration
- Verify all environment variables are set in Cloudflare dashboard

## Future Enhancements

- [ ] School emblem integration
- [ ] Push notifications for match updates
- [ ] Historical statistics dashboard
- [ ] Mobile app version
- [ ] Live streaming integration

## Support

For issues or questions about the tournament reporting system, please contact the CBL technical team.