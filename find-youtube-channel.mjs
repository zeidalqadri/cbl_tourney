import https from 'https';

// Since we know the channel handle is @OrganizerCBL, let's find the channel ID
const CHANNEL_HANDLE = 'OrganizerCBL';

// First, let's check if the current channel ID is correct
const CURRENT_CHANNEL_ID = 'UCqLDgaXvWmDQHiPWS7fL5Ag';

console.log('🔍 Finding the correct YouTube channel ID for @OrganizerCBL...\n');

// Method 1: Direct channel page check
console.log('Method 1: Checking channel page directly...');
const channelUrl = `https://www.youtube.com/@${CHANNEL_HANDLE}`;

https.get(channelUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Look for channel ID patterns in the HTML
    const channelIdMatch = data.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
    const browseIdMatch = data.match(/"browseId":"(UC[a-zA-Z0-9_-]{22})"/);
    const externalIdMatch = data.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})"/);
    
    const foundId = channelIdMatch?.[1] || browseIdMatch?.[1] || externalIdMatch?.[1];
    
    if (foundId) {
      console.log(`✅ Found channel ID: ${foundId}`);
      console.log(`Current ID in code: ${CURRENT_CHANNEL_ID}`);
      console.log(`Match: ${foundId === CURRENT_CHANNEL_ID ? '✅ YES' : '❌ NO - NEEDS UPDATE'}`);
      
      if (foundId !== CURRENT_CHANNEL_ID) {
        console.log('\n🚨 ACTION REQUIRED:');
        console.log(`Update the channel ID in StreamView.tsx from:`);
        console.log(`  ${CURRENT_CHANNEL_ID}`);
        console.log(`to:`);
        console.log(`  ${foundId}`);
      }
    } else {
      console.log('❌ Could not find channel ID in page source');
      console.log('Trying alternative method...');
      
      // Method 2: Check the current channel ID
      const testUrl = `https://www.youtube.com/channel/${CURRENT_CHANNEL_ID}`;
      https.get(testUrl, { 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' 
        }
      }, (testRes) => {
        console.log(`\nTesting current channel ID: ${CURRENT_CHANNEL_ID}`);
        console.log(`Status: ${testRes.statusCode}`);
        console.log(`Location: ${testRes.headers.location || 'No redirect'}`);
        
        if (testRes.headers.location && testRes.headers.location.includes('@')) {
          const handle = testRes.headers.location.match(/@([^\/]+)/)?.[1];
          console.log(`Redirects to: @${handle}`);
          console.log(`Expected: @${CHANNEL_HANDLE}`);
          console.log(`Match: ${handle === CHANNEL_HANDLE ? '✅ YES' : '❌ NO'}`);
        }
      });
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});