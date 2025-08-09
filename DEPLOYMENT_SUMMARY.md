# CBL Tournament Live Coverage - Deployment Summary

## Deployment Details

**Live URL**: https://2670b51e.cbl-basketball-tracker.pages.dev

**Deployment Date**: August 4, 2025

## Configuration Status

### ✅ Completed
1. **YouTube API Configuration**
   - API Key: Configured in `.env.local`
   - Channel ID: OrganizerCBL

2. **Build & Deployment**
   - Successfully built with Next.js static export
   - Deployed to Cloudflare Pages
   - All pages are accessible and working

### ⚠️ Pending Manual Steps

1. **Database Migration**
   - The migration file is ready at: `/supabase/migrations/20250804_add_media_content.sql`
   - **Action Required**: Run this migration in your Supabase dashboard:
     1. Go to https://supabase.com/dashboard/project/tnglzpywvtafomngxsgc/sql
     2. Paste the migration SQL
     3. Execute

2. **Environment Variables on Cloudflare**
   - Add these to Cloudflare Pages settings:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://tnglzpywvtafomngxsgc.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSyCUH80Lcyvusqv1e_N_hzwrMDnp4dt_LJ0
     NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=OrganizerCBL
     ```

3. **N8N Workflow Setup**
   - Use webhook URL: https://2670b51e.cbl-basketball-tracker.pages.dev/webhook-handler.html
   - Configure workflows as described in `/docs/n8n-integration.md`

## Key Features Deployed

1. **Media Management**
   - Photo upload interface at `/admin`
   - YouTube video sync capability
   - Media viewer in match cards

2. **Webhook Integration**
   - Test interface at `/webhooks`
   - Support for YouTube sync, photo uploads, and match status updates

3. **Live Coverage Support**
   - Venue-based content (Yu Hwa: Video, Malim: Photos)
   - Real-time media updates (when database migration is applied)

## Testing Checklist

- [ ] Run database migration
- [ ] Test photo upload at `/admin`
- [ ] Test YouTube sync at `/webhooks`
- [ ] Verify media appears in match cards
- [ ] Test N8N webhook integration

## Next Steps

1. Complete the database migration
2. Set up N8N workflows for automated content
3. Brief photographers on using the upload interface
4. Monitor the live coverage during tomorrow's matches

## Support

For issues or questions:
- Check `/docs/n8n-integration.md` for integration guide
- Review `/docs/media-testing-checklist.md` for testing procedures
- Migration SQL available at `/scripts/manual-migration.sql`