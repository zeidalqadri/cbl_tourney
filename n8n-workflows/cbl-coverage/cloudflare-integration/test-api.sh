#!/bin/bash

# Test script for the deployed YouTube API Worker
# This script tests the API endpoints and CORS headers

set -e

WORKER_URL="https://cbl-coverage-api.zeidalqadri.workers.dev"

echo "🧪 Testing YouTube API Worker"
echo "=============================="
echo "Worker URL: $WORKER_URL"
echo ""

# Test CORS preflight request
echo "1. Testing CORS preflight (OPTIONS)..."
echo "----------------------------------------"
CORS_RESPONSE=$(curl -s -I -X OPTIONS \
  -H "Origin: https://cbl-tourney.pages.dev" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  "$WORKER_URL/api/youtube/search")

echo "$CORS_RESPONSE"

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo "✅ CORS headers present"
else
    echo "❌ CORS headers missing"
fi
echo ""

# Test live endpoint
echo "2. Testing /api/youtube/live endpoint..."
echo "----------------------------------------"
LIVE_RESPONSE=$(curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Origin: https://cbl-tourney.pages.dev" \
  "$WORKER_URL/api/youtube/live")

echo "$LIVE_RESPONSE"
echo ""

# Test search endpoint without query
echo "3. Testing /api/youtube/search (no query)..."
echo "---------------------------------------------"
SEARCH_NO_QUERY=$(curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Origin: https://cbl-tourney.pages.dev" \
  "$WORKER_URL/api/youtube/search")

echo "$SEARCH_NO_QUERY"
echo ""

# Test search endpoint with query
echo "4. Testing /api/youtube/search?q=melaka..."
echo "-------------------------------------------"
SEARCH_WITH_QUERY=$(curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Origin: https://cbl-tourney.pages.dev" \
  "$WORKER_URL/api/youtube/search?q=melaka")

echo "$SEARCH_WITH_QUERY"
echo ""

# Test 404 endpoint
echo "5. Testing non-existent endpoint..."
echo "------------------------------------"
NOT_FOUND=$(curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Origin: https://cbl-tourney.pages.dev" \
  "$WORKER_URL/api/invalid")

echo "$NOT_FOUND"
echo ""

echo "🏁 Testing completed!"
echo ""
echo "📝 Expected results:"
echo "   1. CORS headers should include Access-Control-Allow-Origin"
echo "   2. /api/youtube/live should return {\"live\": []}"
echo "   3. /api/youtube/search should return videos array"
echo "   4. /api/youtube/search?q=melaka should filter videos"
echo "   5. Invalid endpoints should return 404"