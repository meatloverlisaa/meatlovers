#!/bin/bash

# Comprehensive API Endpoint Testing Script
# Tests all endpoints for 401, 404, 429, 500 errors

echo "======================================"
echo "API ENDPOINT DIAGNOSTIC TEST"
echo "======================================"
echo ""

API_BASE="http://localhost:3001"
UI_BASE="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local token=$3
    local expected_status=$4
    local description=$5
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -z "$token" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE$endpoint" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token" 2>&1)
    fi
    
    status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} $description - Status: $status_code"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} $description - Expected: $expected_status, Got: $status_code"
        FAILED=$((FAILED + 1))
        
        # Check for specific errors
        if [ "$status_code" == "401" ]; then
            echo "  → Authentication required or token invalid"
        elif [ "$status_code" == "404" ]; then
            echo "  → Endpoint not found"
        elif [ "$status_code" == "429" ]; then
            echo "  → Rate limit exceeded"
        elif [ "$status_code" == "500" ]; then
            echo "  → Internal server error"
            echo "$response" | head -n -1 | grep -i "error" | head -2
        fi
    fi
}

echo "Step 1: Testing API Health"
echo "----------------------------"
test_endpoint "GET" "/health" "" "200" "Health check"
echo ""

echo "Step 2: Testing Public Endpoints"
echo "---------------------------------"
test_endpoint "POST" "/website/leads" "" "400" "Website leads (no data)"
echo ""

echo "Step 3: Testing Authentication"
echo "-------------------------------"
# Login as different roles to get tokens
echo "Logging in as different roles..."

# Super Admin
SUPER_ADMIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email_or_phone":"superadmin@meatlovers.com","password":"SuperAdmin@1234"}')
SUPER_ADMIN_TOKEN=$(echo $SUPER_ADMIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Admin
ADMIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email_or_phone":"admin@meatlovers.com","password":"Admin@1234"}')
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Manager
MANAGER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email_or_phone":"manager@meatlovers.com","password":"Manager@1234"}')
MANAGER_TOKEN=$(echo $MANAGER_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Chef
CHEF_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email_or_phone":"chef@meatlovers.com","password":"Chef@1234"}')
CHEF_TOKEN=$(echo $CHEF_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Bartender
BARMAN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email_or_phone":"barman@meatlovers.com","password":"Barman@1234"}')
BARMAN_TOKEN=$(echo $BARMAN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Storekeeper
STOREKEEPER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email_or_phone":"storekeeper@meatlovers.com","password":"Storekeeper@1234"}')
STOREKEEPER_TOKEN=$(echo $STOREKEEPER_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}✗ Failed to get admin token${NC}"
else
    echo -e "${GREEN}✓ Successfully authenticated as admin${NC}"
fi
echo ""

echo "Step 4: Testing Kitchen Endpoints"
echo "----------------------------------"
test_endpoint "GET" "/kitchen/queue" "$CHEF_TOKEN" "200" "Kitchen queue"
test_endpoint "GET" "/kitchen/summary" "$CHEF_TOKEN" "200" "Kitchen summary"
test_endpoint "GET" "/kitchen/activity" "$CHEF_TOKEN" "200" "Kitchen activity"
echo ""

echo "Step 5: Testing Bar Endpoints"
echo "------------------------------"
test_endpoint "GET" "/bar/queue" "$BARMAN_TOKEN" "200" "Bar queue"
test_endpoint "GET" "/bar/summary" "$BARMAN_TOKEN" "200" "Bar summary"
echo ""

echo "Step 6: Testing Product Endpoints"
echo "----------------------------------"
test_endpoint "GET" "/products" "$ADMIN_TOKEN" "200" "Get all products"
test_endpoint "GET" "/products/categories" "$ADMIN_TOKEN" "200" "Get product categories"
echo ""

echo "Step 7: Testing Stock Endpoints"
echo "--------------------------------"
test_endpoint "GET" "/stock" "$STOREKEEPER_TOKEN" "200" "Get stock items"
test_endpoint "GET" "/stock/summary" "$STOREKEEPER_TOKEN" "200" "Stock summary"
echo ""

echo "Step 8: Testing Supplier Endpoints"
echo "-----------------------------------"
test_endpoint "GET" "/suppliers" "$ADMIN_TOKEN" "200" "Get all suppliers"
echo ""

echo "Step 9: Testing Order Endpoints"
echo "--------------------------------"
test_endpoint "GET" "/orders" "$ADMIN_TOKEN" "200" "Get all orders"
test_endpoint "GET" "/orders/active" "$ADMIN_TOKEN" "200" "Get active orders"
echo ""

echo "Step 10: Testing Table Endpoints"
echo "---------------------------------"
test_endpoint "GET" "/tables" "$ADMIN_TOKEN" "200" "Get all tables"
echo ""

echo "Step 11: Testing User Endpoints"
echo "--------------------------------"
test_endpoint "GET" "/users" "$ADMIN_TOKEN" "200" "Get all users"
test_endpoint "GET" "/users/profile" "$ADMIN_TOKEN" "200" "Get user profile"
echo ""

echo "Step 12: Testing Protected Endpoints (Should be 401 without token)"
echo "-------------------------------------------------------------------"
test_endpoint "GET" "/kitchen/queue" "" "401" "Kitchen queue without auth"
test_endpoint "GET" "/bar/queue" "" "401" "Bar queue without auth"
test_endpoint "GET" "/products" "" "401" "Products without auth"
echo ""

echo "Step 13: Testing Non-Existent Endpoints (Should be 404)"
echo "--------------------------------------------------------"
test_endpoint "GET" "/nonexistent" "$ADMIN_TOKEN" "404" "Non-existent endpoint"
test_endpoint "GET" "/api/fake" "$ADMIN_TOKEN" "404" "Fake API endpoint"
echo ""

echo ""
echo "======================================"
echo "TEST SUMMARY"
echo "======================================"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Check errors above.${NC}"
    exit 1
fi
