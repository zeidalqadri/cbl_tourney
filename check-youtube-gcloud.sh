#!/bin/bash

echo "Checking YouTube channel @OrganizerCBL using gcloud..."
echo

# Get access token
ACCESS_TOKEN=$(gcloud auth print-access-token)

if [ -z "$ACCESS_TOKEN" ]; then
    echo "Error: Could not get access token. Please run 'gcloud auth login' first."
    exit 1
fi

echo "1. Searching for channel by handle @OrganizerCBL..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://youtube.googleapis.com/youtube/v3/channels?part=id,snippet&forHandle=OrganizerCBL" | jq '.'

echo
echo "2. Searching for channel by name 'OrganizerCBL'..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=OrganizerCBL&type=channel&maxResults=5" | jq '.'

echo
echo "3. Testing the current channel ID in the code: UCqLDgaXvWmDQHiPWS7fL5Ag"
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=UCqLDgaXvWmDQHiPWS7fL5Ag" | jq '.'