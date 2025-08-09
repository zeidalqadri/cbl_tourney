// Test YouTube channel ID by checking if videos exist
const channelId = 'UCqLDgaXvWmDQHiPWS7fL5Ag';
const apiKey = 'AIzaSyCUH80Lcyvusqv1e_N_hzwrMDnp4dt_LJ0';

async function verifyChannel() {
  console.log('Verifying YouTube channel ID:', channelId);
  console.log('Expected channel: @OrganizerCBL\n');

  // Try to get channel info
  try {
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`;
    const response = await fetch(channelUrl);
    const data = await response.json();

    if (data.error) {
      console.error('API Error:', data.error.message);
      
      // If quota exceeded, try alternative verification
      console.log('\nTrying alternative verification...');
      
      // Check if channel page loads
      const channelPageUrl = `https://www.youtube.com/channel/${channelId}`;
      const pageResponse = await fetch(channelPageUrl, { redirect: 'follow' });
      
      console.log('Channel page status:', pageResponse.status);
      console.log('Final URL:', pageResponse.url);
      
      if (pageResponse.url.includes('@OrganizerCBL')) {
        console.log('✅ Channel ID verified! Redirects to @OrganizerCBL');
      } else {
        console.log('❌ Channel ID may not match @OrganizerCBL');
      }
      
      return;
    }

    if (data.items && data.items.length > 0) {
      const channel = data.items[0];
      console.log('✅ Channel found!');
      console.log('Channel Title:', channel.snippet.title);
      console.log('Channel Description:', channel.snippet.description?.substring(0, 100) + '...');
      console.log('Custom URL:', channel.snippet.customUrl);
    } else {
      console.log('❌ No channel found with this ID');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Also check the uploads playlist
  console.log('\nChecking uploads playlist...');
  const uploadsPlaylistId = 'UU' + channelId.substring(2);
  console.log('Uploads playlist ID:', uploadsPlaylistId);
  
  // Test the embed URL we're using
  console.log('\nEmbed URLs being used:');
  console.log('- Live stream:', `https://www.youtube.com/embed/live_stream?channel=${channelId}`);
  console.log('- Channel videos:', `https://www.youtube.com/embed/videoseries?list=${uploadsPlaylistId}`);
}

verifyChannel();