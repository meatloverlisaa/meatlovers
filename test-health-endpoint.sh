#!/bin/bash

# Health Endpoint Test Script
# Tests the API health endpoint and verifies 200 OK response

echo "🏥 Testing API Health Endpoint"
echo "================================"
echo ""

API_URL="${API_URL:-http://localhost:3001}"
HEALTH_ENDPOINT="$API_URL/health"

echo "📍 Testing: $HEALTH_ENDPOINT"
echo ""

# Test 1: Check HTTP Status Code
echo "Test 1: HTTP Status Code"
echo "------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ PASS - HTTP Status: $HTTP_CODE OK"
else
    echo "❌ FAIL - HTTP Status: $HTTP_CODE (Expected: 200)"
    exit 1
fi
echo ""

# Test 2: Response Content-Type
echo "Test 2: Content-Type Header"
echo "---------------------------"
CONTENT_TYPE=$(curl -s -I "$HEALTH_ENDPOINT" | grep -i "content-type" | awk '{print $2}' | tr -d '\r')
if [[ "$CONTENT_TYPE" == *"application/json"* ]]; then
    echo "✅ PASS - Content-Type: $CONTENT_TYPE"
else
    echo "❌ FAIL - Content-Type: $CONTENT_TYPE (Expected: application/json)"
    exit 1
fi
echo ""

# Test 3: Response Body Structure
echo "Test 3: Response Body Structure"
echo "-------------------------------"
RESPONSE=$(curl -s "$HEALTH_ENDPOINT")
echo "$RESPONSE" | jq . > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ PASS - Valid JSON response"
else
    echo "❌ FAIL - Invalid JSON response"
    exit 1
fi
echo ""

# Test 4: Required Fields
echo "Test 4: Required Fields"
echo "----------------------"
REQUIRED_FIELDS=("status" "timestamp" "service" "uptime" "memory")
ALL_FIELDS_PRESENT=true

for field in "${REQUIRED_FIELDS[@]}"; do
    if echo "$RESPONSE" | jq -e ".$field" > /dev/null 2>&1; then
        echo "✅ Field '$field' present"
    else
        echo "❌ Field '$field' missing"
        ALL_FIELDS_PRESENT=false
    fi
done
echo ""

if [ "$ALL_FIELDS_PRESENT" = false ]; then
    echo "❌ FAIL - Missing required fields"
    exit 1
fi

# Test 5: Status Value
echo "Test 5: Status Value"
echo "-------------------"
STATUS=$(echo "$RESPONSE" | jq -r '.status')
if [ "$STATUS" = "ok" ]; then
    echo "✅ PASS - Status: $STATUS"
else
    echo "❌ FAIL - Status: $STATUS (Expected: ok)"
    exit 1
fi
echo ""

# Test 6: Display Full Response
echo "Test 6: Full Response Data"
echo "-------------------------"
echo "$RESPONSE" | jq .
echo ""

# Summary
echo "================================"
echo "✅ ALL TESTS PASSED"
echo "================================"
echo ""
echo "Summary:"
echo "  • HTTP Status: 200 OK"
echo "  • Content-Type: application/json"
echo "  • Status: ok"
echo "  • Uptime: $(echo "$RESPONSE" | jq -r '.uptime') seconds"
echo "  • Memory Used: $(echo "$RESPONSE" | jq -r '.memory.used')"
echo "  • Memory Total: $(echo "$RESPONSE" | jq -r '.memory.total')"
echo ""
