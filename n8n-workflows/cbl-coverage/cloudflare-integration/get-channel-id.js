#!/usr/bin/env node

/**
 * Get YouTube Channel ID from Handle
 * Usage: node get-channel-id.js YOUR_API_KEY
 */

async function getChannelIdFromHandle(apiKey, handle) {
  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.append('part', 'snippet,contentDetails,statistics');
  url.searchParams.append('forHandle', handle);
  url.searchParams.append('key', apiKey);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`YouTube API Error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.items || data.items.length === 0) {
      throw new Error(`No channel found for handle: ${handle}`);
    }

    const channel = data.items[0];
    return {
      success: true,
      channelId: channel.id,
      channelTitle: channel.snippet.title,
      description: channel.snippet.description,
      subscriberCount: channel.statistics?.subscriberCount || 'Hidden',
      videoCount: channel.statistics?.videoCount || 'Unknown',
      customUrl: channel.snippet.customUrl || 'Not set'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Main execution
async function main() {
  const apiKey = process.argv[2];
  const handle = '@OrganizerCBL';

  if (!apiKey) {
    console.error('Usage: node get-channel-id.js YOUR_YOUTUBE_API_KEY');
    console.error('');
    console.error('Get your API key from:');
    console.error('https://console.developers.google.com/');
    console.error('1. Create a project or select existing');
    console.error('2. Enable YouTube Data API v3');
    console.error('3. Create credentials (API key)');
    process.exit(1);
  }

  console.log(`Fetching channel ID for: ${handle}`);
  console.log('');

  const result = await getChannelIdFromHandle(apiKey, handle);

  if (result.success) {
    console.log('✅ Success! Channel found:');
    console.log('');
    console.log(`Channel ID: ${result.channelId}`);
    console.log(`Channel Title: ${result.channelTitle}`);
    console.log(`Subscribers: ${result.subscriberCount}`);
    console.log(`Total Videos: ${result.videoCount}`);
    console.log(`Custom URL: ${result.customUrl}`);
    console.log('');
    console.log('You can now use this channel ID in your YouTube API configuration:');
    console.log(`CHANNEL_ID: '${result.channelId}'`);
  } else {
    console.error('❌ Error:', result.error);
    console.error('');
    console.error('Common issues:');
    console.error('- Invalid API key');
    console.error('- API key not enabled for YouTube Data API v3');
    console.error('- Handle does not exist or is private');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}