#!/bin/bash

# Test script for your Airtable base: appWQnpqml0xHknlL
# Make sure to set your AIRTABLE_API_KEY first!

echo "🧪 CBL Coverage - Airtable Base Test"
echo "===================================="
echo ""

# Check if API key is set
if [ -z "$AIRTABLE_API_KEY" ]; then
    echo "❌ Error: AIRTABLE_API_KEY not set!"
    echo ""
    echo "Set it with:"
    echo "export AIRTABLE_API_KEY='your_key_here'"
    exit 1
fi

BASE_ID="appWQnpqml0xHknlL"
TABLE_NAME="venue_status"
API_URL="https://api.airtable.com/v0/$BASE_ID/$TABLE_NAME"

echo "📊 Testing connection to your Airtable base..."
echo "Base ID: $BASE_ID"
echo ""

# Test 1: List all records
echo "Test 1: Fetching venue records..."
response=$(curl -s -X GET "$API_URL?maxRecords=10" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  -H "Content-Type: application/json")

if echo "$response" | grep -q "error"; then
    echo "❌ Error connecting to Airtable:"
    echo "$response" | jq .
    exit 1
else
    echo "✅ Successfully connected!"
    echo ""
    echo "Current venues:"
    echo "$response" | jq -r '.records[] | "\(.fields.venue) - Status: \(.fields.status // "Ready") - Type: \(.fields.content_type // "N/A")"'
fi

echo ""
echo "----------------------------------------"
echo ""

# Test 2: Check for pending updates
echo "Test 2: Checking for pending updates..."
filter_formula="AND({status_changed}=TRUE(),{processed}=FALSE())"
encoded_filter=$(echo -n "filterByFormula=$filter_formula" | sed 's/ /%20/g' | sed 's/{/%7B/g' | sed 's/}/%7D/g')

pending_response=$(curl -s -X GET "$API_URL?$encoded_filter" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  -H "Content-Type: application/json")

pending_count=$(echo "$pending_response" | jq '.records | length')
echo "📋 Pending updates: $pending_count"

if [ "$pending_count" -gt 0 ]; then
    echo ""
    echo "Venues needing processing:"
    echo "$pending_response" | jq -r '.records[] | "- \(.fields.venue) (\(.fields.content_type))"'
fi

echo ""
echo "----------------------------------------"
echo ""

# Test 3: Simulate a check-in
echo "Test 3: Would you like to simulate a check-in? (y/n)"
read -r simulate

if [ "$simulate" = "y" ]; then
    echo ""
    echo "Select venue:"
    echo "1) Yu Hwa"
    echo "2) Malim"
    echo "3) Kuala Nerang"
    echo "4) Gemencheh"
    read -r venue_choice
    
    case $venue_choice in
        1) venue="Yu Hwa";;
        2) venue="Malim";;
        3) venue="Kuala Nerang";;
        4) venue="Gemencheh";;
        *) echo "Invalid choice"; exit 1;;
    esac
    
    echo ""
    echo "Select content type:"
    echo "1) Video"
    echo "2) Photos"
    read -r content_choice
    
    case $content_choice in
        1) content_type="video"; status="Video Ready";;
        2) content_type="photos"; status="Photos Uploaded";;
        *) echo "Invalid choice"; exit 1;;
    esac
    
    # Find the record ID for the selected venue
    record_id=$(echo "$response" | jq -r ".records[] | select(.fields.venue == \"$venue\") | .id")
    
    if [ -z "$record_id" ]; then
        echo "❌ Could not find venue: $venue"
        exit 1
    fi
    
    echo ""
    echo "📤 Updating $venue with $content_type..."
    
    update_data='{
      "fields": {
        "status": "'$status'",
        "content_type": "'$content_type'",
        "status_changed": true,
        "processed": false,
        "last_updated": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
        "updated_by": "test-script"
      }
    }'
    
    update_response=$(curl -s -X PATCH "$API_URL/$record_id" \
      -H "Authorization: Bearer $AIRTABLE_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$update_data")
    
    if echo "$update_response" | grep -q "error"; then
        echo "❌ Update failed:"
        echo "$update_response" | jq .
    else
        echo "✅ Successfully updated!"
        echo ""
        echo "Updated record:"
        echo "$update_response" | jq -r '.fields | "Venue: \(.venue)\nStatus: \(.status)\nType: \(.content_type)\nNeeds Processing: \(.status_changed)"'
        echo ""
        echo "This record will now be picked up by the n8n workflow!"
    fi
fi

echo ""
echo "----------------------------------------"
echo ""
echo "📝 Next steps:"
echo "1. Add your API key to n8n credentials"
echo "2. Use Base ID: appWQnpqml0xHknlL"
echo "3. Import the workflow JSON"
echo "4. Test with Execute Workflow button"
echo ""
echo "✅ Your Airtable base is ready for n8n!"