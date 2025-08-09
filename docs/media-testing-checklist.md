# Media Workflow Testing Checklist

## Pre-Testing Setup

- [ ] Ensure Supabase credentials are set in `.env.local`
- [ ] Add YouTube API key and channel ID to `.env.local`
- [ ] Verify database migration has been applied
- [ ] Clear browser cache and local storage

## 1. Manual Photo Upload Testing

### Via Admin Interface
- [ ] Navigate to `/admin`
- [ ] Test photo upload section appears
- [ ] Select a venue (SJKC MALIM)
- [ ] Enter match number (e.g., 1)
- [ ] Select division (boys/girls)
- [ ] Upload single photo
- [ ] Add caption and photographer name
- [ ] Submit and verify success message
- [ ] Upload multiple photos at once
- [ ] Verify all photos uploaded successfully

### Verification
- [ ] Navigate to match card for the uploaded match
- [ ] Click "Media" button
- [ ] Verify photos appear in the viewer
- [ ] Test photo lightbox functionality
- [ ] Check captions and photographer credits

## 2. YouTube Video Sync Testing

### Manual Sync via Webhooks Page
- [ ] Navigate to `/webhooks`
- [ ] Click "Manual YouTube Sync"
- [ ] Verify sync completes successfully
- [ ] Check response shows videos processed

### Video Matching Verification
- [ ] Ensure YouTube video titles contain "Match #X" or venue name
- [ ] Check that videos are correctly matched to games
- [ ] Verify video thumbnails load properly
- [ ] Test video playback in MediaViewer

## 3. N8N Webhook Integration Testing

### Generate Webhook URL
- [ ] Go to `/webhooks`
- [ ] Click "Generate Webhook URL"
- [ ] Copy URL for N8N configuration

### Test Each Webhook Type
- [ ] **YouTube Sync**: Click "Test YouTube Sync" button
  - Verify success response
  - Check videos added to matches
  
- [ ] **Photo Upload**: Click "Test Photo Upload" button
  - Verify test photo is processed
  - Check match association works
  
- [ ] **Match Status**: Click "Test Match Status" button
  - Verify status update works
  - Check live stream URL is saved

## 4. Real-time Updates Testing

### Live Updates Dashboard
- [ ] Open site in two browser tabs
- [ ] Upload media in one tab
- [ ] Verify notification appears in second tab
- [ ] Check LiveUpdatesDashboard shows recent updates
- [ ] Test notification permissions prompt

### Match Card Real-time Updates
- [ ] Open match with media in browser
- [ ] Add new media via webhook or upload
- [ ] Verify red notification dot appears
- [ ] Open media viewer
- [ ] Confirm new content is visible without refresh

## 5. Media Viewer Testing

### Photo Gallery
- [ ] Click through multiple photos
- [ ] Test navigation arrows
- [ ] Verify captions display correctly
- [ ] Test closing gallery with X button
- [ ] Check responsive design on mobile

### Video Player
- [ ] Play embedded YouTube videos
- [ ] Test fullscreen mode
- [ ] Verify video controls work
- [ ] Check multiple videos in same match

## 6. Venue-Based Content Testing

### Yu Hwa (Video Coverage)
- [ ] Verify matches at Yu Hwa show video indicator
- [ ] Test live stream URL functionality
- [ ] Check "hasLiveVideo" flag works correctly

### Malim (Photo Coverage)
- [ ] Verify matches at Malim show photo indicator
- [ ] Test photographer upload workflow
- [ ] Check venue-based filtering works

## 7. Error Handling Testing

### Invalid Data
- [ ] Upload photo without match association
- [ ] Test with non-existent match number
- [ ] Upload oversized images
- [ ] Test with invalid YouTube video IDs

### Network Issues
- [ ] Test offline behavior
- [ ] Verify error messages are user-friendly
- [ ] Check retry mechanisms work

## 8. Performance Testing

### Load Testing
- [ ] Upload 20+ photos to single match
- [ ] Verify page performance remains good
- [ ] Test with multiple videos per match
- [ ] Check lazy loading works for images

### Mobile Performance
- [ ] Test on actual mobile devices
- [ ] Verify touch gestures work
- [ ] Check data usage is reasonable
- [ ] Test on slow 3G connection

## 9. Cross-browser Testing

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Mobile browsers (Chrome, Safari)

## 10. Security Testing

### Access Control
- [ ] Verify upload requires proper authentication
- [ ] Test that media URLs are publicly accessible
- [ ] Check for XSS vulnerabilities in captions
- [ ] Verify file type restrictions work

## Post-Testing Cleanup

- [ ] Document any issues found
- [ ] Create GitHub issues for bugs
- [ ] Update documentation if needed
- [ ] Clear test data if necessary

## Sign-off

- [ ] All critical features working
- [ ] No blocking bugs found
- [ ] Performance acceptable
- [ ] Ready for production use

**Tested by:** _______________
**Date:** _______________
**Environment:** _______________