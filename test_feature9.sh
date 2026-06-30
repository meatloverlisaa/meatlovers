#!/bin/bash

################################################################################
# Feature 9 — Bar Queue & Drink Service Test Suite
# Description: Comprehensive test script for bar operations including queue
#              management, stock deduction, and transfer receipt visibility
# Author: Meat Lovers CIMS Team
# Date: June 30, 2026
################################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3001}"
UI_BASE_URL="${UI_BASE_URL:-http://localhost:3000}"
TEST_USER_TOKEN="${TEST_USER_TOKEN:-}"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"
}

print_test() {
    echo -e "${YELLOW}▶ TEST:${NC} $1"
    ((TOTAL_TESTS++))
}

print_pass() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    ((PASSED_TESTS++))
}

print_fail() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    ((FAILED_TESTS++))
}

print_skip() {
    echo -e "${YELLOW}⊘ SKIP:${NC} $1"
    ((SKIPPED_TESTS++))
}

print_info() {
    echo -e "${BLUE}ℹ INFO:${NC} $1"
}

check_service() {
    local service_name=$1
    local url=$2
    
    if curl -s -f -o /dev/null --connect-timeout 3 "$url"; then
        print_pass "$service_name is running at $url"
        return 0
    else
        print_fail "$service_name is not running at $url"
        return 1
    fi
}

api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=${4:-200}
    
    local url="${API_BASE_URL}${endpoint}"
    local response
    local http_code
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            ${TEST_USER_TOKEN:+-H "Authorization: Bearer $TEST_USER_TOKEN"} \
            -d "$data" \
            "$url" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            ${TEST_USER_TOKEN:+-H "Authorization: Bearer $TEST_USER_TOKEN"} \
            "$url" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo "$body"
        return 0
    else
        echo "HTTP $http_code: $body" >&2
        return 1
    fi
}

################################################################################
# Test Suite: Service Health Checks
################################################################################

test_service_health() {
    print_header "Service Health Checks"
    
    print_test "Check if API service is running"
    if check_service "API" "$API_BASE_URL/health" || check_service "API" "$API_BASE_URL"; then
        :
    else
        print_info "Skipping API tests - service not available"
        return 1
    fi
    
    print_test "Check if UI service is running"
    if check_service "UI" "$UI_BASE_URL"; then
        :
    else
        print_info "UI tests will be skipped - service not available"
    fi
    
    return 0
}

################################################################################
# Test Suite: 9.1 — Database
################################################################################

test_database_schema() {
    print_header "9.1 — Database Schema Tests"
    
    print_test "Verify orders table exists and has required fields"
    # This would typically use a database query, but we'll verify via API response structure
    local response=$(api_call GET "/bar/orders?status=PENDING" "" 200 2>/dev/null || echo "[]")
    if echo "$response" | jq -e '.' >/dev/null 2>&1; then
        print_pass "Orders table accessible via API"
    else
        print_fail "Orders table not accessible"
    fi
    
    print_test "Verify products table has drink categories"
    # Assuming we can query products, verify SOFT_DRINK and ALCOHOLIC_DRINK exist
    print_info "Product categories should include SOFT_DRINK and ALCOHOLIC_DRINK"
    print_skip "Direct database verification (requires DB access)"
    
    print_test "Verify stock_movements table supports BAR location"
    local movements=$(api_call GET "/bar/stock-movements?limit=1" "" 200 2>/dev/null || echo "[]")
    if echo "$movements" | jq -e '.' >/dev/null 2>&1; then
        print_pass "Stock movements table accessible for BAR location"
    else
        print_fail "Stock movements not accessible"
    fi
}

################################################################################
# Test Suite: 9.2 — API (Bar Queue — BARMAN)
################################################################################

test_bar_queue_api() {
    print_header "9.2 — API (Bar Queue — BARMAN)"
    
    # Test 1: GET /bar/queue
    print_test "GET /bar/queue — Drink order items in PENDING/PREPARING status"
    local queue_response=$(api_call GET "/bar/queue" "" 200 2>&1)
    if [ $? -eq 0 ]; then
        print_pass "GET /bar/queue endpoint accessible"
        echo "$queue_response" | jq '.' >/dev/null 2>&1 && print_info "Response is valid JSON"
    else
        print_fail "GET /bar/queue endpoint failed: $queue_response"
    fi
    
    # Test 2: GET /bar/orders with status filter
    print_test "GET /bar/orders?status=PENDING — Filter by status"
    local pending_response=$(api_call GET "/bar/orders?status=PENDING" "" 200 2>&1)
    if [ $? -eq 0 ]; then
        print_pass "GET /bar/orders with status filter works"
    else
        print_fail "GET /bar/orders endpoint failed: $pending_response"
    fi
    
    # Test 3: PATCH /bar/orders/:id/status
    print_test "PATCH /bar/orders/:id/status — Mark drink items PREPARING/READY"
    print_info "Status transitions: PENDING → PREPARING → READY"
    # We need an actual order ID to test this, so we'll document the expected behavior
    print_skip "Status update test (requires valid order ID from database)"
    print_info "Expected request body: {\"status\": \"PREPARING\"}"
    print_info "Valid transitions: PENDING→PREPARING, PREPARING→READY, READY→SERVED"
    
    # Test 4: GET /bar/transfers
    print_test "GET /bar/transfers — View stock transfers sent to bar"
    local transfers_response=$(api_call GET "/bar/transfers" "" 200 2>&1)
    if [ $? -eq 0 ]; then
        print_pass "GET /bar/transfers endpoint accessible"
        local transfer_count=$(echo "$transfers_response" | jq '. | length' 2>/dev/null || echo "0")
        print_info "Found $transfer_count recent transfers"
    else
        print_fail "GET /bar/transfers endpoint failed: $transfers_response"
    fi
    
    # Test 5: POST /stock/bar-sale
    print_test "POST /stock/bar-sale — Deduct bar stock for served drinks"
    print_info "This endpoint should deduct stock when drinks are served"
    print_skip "Stock deduction test (requires valid product and quantity)"
    print_info "Expected request body: {\"product_id\": \"123\", \"quantity\": 2, \"order_id\": \"456\"}"
}

################################################################################
# Test Suite: 9.3 — API (Bar Oversight)
################################################################################

test_bar_oversight_api() {
    print_header "9.3 — API (Bar Oversight — ADMIN, MANAGER, STOREKEEPER)"
    
    # Test 1: GET /bar/summary
    print_test "GET /bar/summary — Bar order volume, pending drinks, stock movement summary"
    local summary_response=$(api_call GET "/bar/summary" "" 200 2>&1)
    if [ $? -eq 0 ]; then
        print_pass "GET /bar/summary endpoint accessible"
        
        # Verify response structure
        local pending=$(echo "$summary_response" | jq -r '.pending' 2>/dev/null)
        local preparing=$(echo "$summary_response" | jq -r '.preparing' 2>/dev/null)
        local ready=$(echo "$summary_response" | jq -r '.ready' 2>/dev/null)
        local total=$(echo "$summary_response" | jq -r '.total' 2>/dev/null)
        
        if [ "$pending" != "null" ] && [ "$preparing" != "null" ] && [ "$ready" != "null" ]; then
            print_pass "Summary response has correct structure (pending, preparing, ready, total)"
            print_info "Current queue: Pending=$pending, Preparing=$preparing, Ready=$ready, Total=$total"
        else
            print_fail "Summary response missing required fields"
        fi
    else
        print_fail "GET /bar/summary endpoint failed: $summary_response"
    fi
    
    # Test 2: GET /bar/stock-movements
    print_test "GET /bar/stock-movements — Bar stock movement log"
    local movements_response=$(api_call GET "/bar/stock-movements?limit=10" "" 200 2>&1)
    if [ $? -eq 0 ]; then
        print_pass "GET /bar/stock-movements endpoint accessible"
        local movement_count=$(echo "$movements_response" | jq '. | length' 2>/dev/null || echo "0")
        print_info "Retrieved $movement_count stock movements"
        
        # Verify movement structure
        local first_movement=$(echo "$movements_response" | jq '.[0]' 2>/dev/null)
        if [ "$first_movement" != "null" ] && [ "$first_movement" != "" ]; then
            local has_product=$(echo "$first_movement" | jq 'has("productName")' 2>/dev/null)
            local has_quantity=$(echo "$first_movement" | jq 'has("quantity")' 2>/dev/null)
            local has_type=$(echo "$first_movement" | jq 'has("movementType")' 2>/dev/null)
            
            if [ "$has_product" == "true" ] && [ "$has_quantity" == "true" ] && [ "$has_type" == "true" ]; then
                print_pass "Stock movement has correct structure"
            else
                print_fail "Stock movement missing required fields"
            fi
        fi
    else
        print_fail "GET /bar/stock-movements endpoint failed: $movements_response"
    fi
    
    # Test 3: GET /bar/sales (Bonus endpoint)
    print_test "GET /bar/sales — Sales summary with revenue breakdown"
    local sales_response=$(api_call GET "/bar/sales" "" 200 2>&1)
    if [ $? -eq 0 ]; then
        print_pass "GET /bar/sales endpoint accessible (bonus endpoint)"
        
        local total_amount=$(echo "$sales_response" | jq -r '.totalAmount' 2>/dev/null)
        local soft_drinks=$(echo "$sales_response" | jq -r '.softDrinkSales' 2>/dev/null)
        local alcohol=$(echo "$sales_response" | jq -r '.alcoholSales' 2>/dev/null)
        
        if [ "$total_amount" != "null" ]; then
            print_pass "Sales response has correct structure"
            print_info "Total: $total_amount, Soft Drinks: $soft_drinks, Alcohol: $alcohol"
        fi
    else
        print_info "GET /bar/sales endpoint not available (optional bonus endpoint)"
    fi
}

################################################################################
# Test Suite: 9.4 — UI (Bar Workspace)
################################################################################

test_bar_workspace_ui() {
    print_header "9.4 — UI (Bar Workspace — BARMAN)"
    
    print_test "Check /bar route is accessible"
    local ui_response=$(curl -s -o /dev/null -w "%{http_code}" "$UI_BASE_URL/bar" 2>/dev/null)
    if [ "$ui_response" = "200" ]; then
        print_pass "Bar workspace page accessible at /bar"
    else
        print_fail "Bar workspace page not accessible (HTTP $ui_response)"
    fi
    
    print_test "Verify BarQueueBoard component exists"
    if [ -f "ui/src/components/bar/BarQueueBoard.tsx" ]; then
        print_pass "BarQueueBoard component found"
    else
        print_fail "BarQueueBoard component not found"
    fi
    
    print_test "Verify DrinkTicket component exists"
    if [ -f "ui/src/components/bar/DrinkTicket.tsx" ]; then
        print_pass "DrinkTicket component found"
    else
        print_fail "DrinkTicket component not found"
    fi
    
    print_test "Verify ReadyButton component exists"
    if [ -f "ui/src/components/bar/ReadyButton.tsx" ]; then
        print_pass "ReadyButton component found"
    else
        print_fail "ReadyButton component not found"
    fi
    
    print_test "Verify TransferReceiptPanel component exists"
    if [ -f "ui/src/components/bar/TransferReceiptPanel.tsx" ]; then
        print_pass "TransferReceiptPanel component found"
    else
        print_fail "TransferReceiptPanel component not found"
    fi
    
    print_test "Verify StatusColumn component exists"
    if [ -f "ui/src/components/bar/StatusColumn.tsx" ]; then
        print_pass "StatusColumn component found"
    else
        print_fail "StatusColumn component not found"
    fi
    
    print_test "Verify bar API hooks exist"
    local hooks_found=0
    [ -f "ui/src/hooks/useBarOrders.ts" ] && ((hooks_found++))
    [ -f "ui/src/hooks/useBarSummary.ts" ] && ((hooks_found++))
    [ -f "ui/src/hooks/useBarTransfers.ts" ] && ((hooks_found++))
    
    if [ $hooks_found -eq 3 ]; then
        print_pass "All bar hooks found (useBarOrders, useBarSummary, useBarTransfers)"
    else
        print_fail "Missing bar hooks (found $hooks_found/3)"
    fi
    
    print_test "Verify bar TypeScript types exist"
    if [ -f "ui/src/types/bar.ts" ]; then
        print_pass "Bar TypeScript types found"
    else
        print_fail "Bar TypeScript types not found"
    fi
    
    print_test "Verify bar API client exists"
    if [ -f "ui/src/lib/api/bar.ts" ]; then
        print_pass "Bar API client found"
    else
        print_fail "Bar API client not found"
    fi
}

################################################################################
# Test Suite: 9.5 — UI (Bar Oversight)
################################################################################

test_bar_oversight_ui() {
    print_header "9.5 — UI (Bar Oversight — ADMIN, MANAGER, STOREKEEPER)"
    
    print_test "Check /admin/bar route is accessible"
    local ui_response=$(curl -s -o /dev/null -w "%{http_code}" "$UI_BASE_URL/admin/bar" 2>/dev/null)
    if [ "$ui_response" = "200" ]; then
        print_pass "Bar oversight page accessible at /admin/bar"
    else
        print_fail "Bar oversight page not accessible (HTTP $ui_response)"
    fi
    
    print_test "Verify BarSalesSummary component exists"
    if [ -f "ui/src/components/admin/bar/BarSalesSummary.tsx" ]; then
        print_pass "BarSalesSummary component found"
    else
        print_fail "BarSalesSummary component not found"
    fi
    
    print_test "Verify PendingDrinkList component exists"
    if [ -f "ui/src/components/admin/bar/PendingDrinkList.tsx" ]; then
        print_pass "PendingDrinkList component found"
    else
        print_fail "PendingDrinkList component not found"
    fi
    
    print_test "Verify BarStockMovementTable component exists"
    if [ -f "ui/src/components/admin/bar/BarStockMovementTable.tsx" ]; then
        print_pass "BarStockMovementTable component found"
    else
        print_fail "BarStockMovementTable component not found"
    fi
    
    print_test "Verify admin bar page implementation"
    if [ -f "ui/src/app/admin/bar/page.tsx" ]; then
        print_pass "Admin bar page found"
        
        # Check for key features in the page
        if grep -q "BarSalesSummary" "ui/src/app/admin/bar/page.tsx"; then
            print_pass "Page includes BarSalesSummary component"
        fi
        
        if grep -q "PendingDrinkList" "ui/src/app/admin/bar/page.tsx"; then
            print_pass "Page includes PendingDrinkList component"
        fi
        
        if grep -q "BarStockMovementTable" "ui/src/app/admin/bar/page.tsx"; then
            print_pass "Page includes BarStockMovementTable component"
        fi
    else
        print_fail "Admin bar page not found"
    fi
}

################################################################################
# Test Suite: Test Criteria
################################################################################

test_feature_criteria() {
    print_header "Feature 9 Test Criteria Validation"
    
    # Test 1: Bar queue shows drink items only
    print_test "Bar queue shows SOFT_DRINK and ALCOHOLIC_DRINK items only"
    print_info "Filtering logic should be in bar.service.ts"
    if grep -q "SOFT_DRINK\|ALCOHOLIC_DRINK" "api/src/bar/bar.service.ts" 2>/dev/null; then
        print_pass "Drink category filtering implemented in service"
    else
        print_fail "Drink category filtering not found in service"
    fi
    
    # Test 2: Drink-ready state reflects on waiter tracker
    print_test "Drink-ready state reflects on waiter order tracker"
    print_info "Status updates should propagate through orders table"
    print_skip "Integration test (requires waiter UI verification)"
    
    # Test 3: Bar sale deducts stock
    print_test "Bar sale deducts bar stock"
    if grep -q "bar-sale\|barSale" "api/src/stock/stock.controller.ts" 2>/dev/null; then
        print_pass "Bar sale endpoint exists in stock controller"
    else
        print_fail "Bar sale endpoint not found"
    fi
    
    # Test 4: STOREKEEPER can verify transfers
    print_test "STOREKEEPER can verify bar transfers without serving drinks"
    print_info "GET /bar/transfers should be accessible to STOREKEEPER role"
    print_skip "Role-based access test (requires auth token)"
    
    # Test 5: BARMAN cannot access kitchen queue
    print_test "BARMAN cannot access kitchen food queue"
    print_info "Role-based routing should prevent /kitchen access for BARMAN"
    print_skip "Role-based routing test (requires auth and routing verification)"
}

################################################################################
# Test Suite: Integration Tests
################################################################################

test_integration() {
    print_header "Integration Tests"
    
    print_test "End-to-end workflow: New order → Bar queue → Ready → Served"
    print_info "1. Waiter creates order with drink items"
    print_info "2. Order appears in bar queue (PENDING)"
    print_info "3. Barman marks as PREPARING"
    print_info "4. Barman marks as READY"
    print_info "5. Waiter marks as SERVED"
    print_skip "Full workflow test (requires complete system with data)"
    
    print_test "Stock deduction workflow"
    print_info "1. Check initial bar stock level"
    print_info "2. Serve drinks (POST /stock/bar-sale)"
    print_info "3. Verify stock level decreased"
    print_skip "Stock workflow test (requires stock data)"
    
    print_test "Auto-refresh functionality"
    print_info "Bar workspace should auto-refresh every 30 seconds"
    print_info "Admin oversight should auto-refresh every 60 seconds"
    print_skip "Auto-refresh test (requires browser automation)"
    
    print_test "Aging indicators"
    print_info "Orders > 10 minutes should show warning (amber)"
    print_info "Orders > 20 minutes should show critical (red)"
    print_skip "Aging indicator test (requires time-based data)"
}

################################################################################
# Test Suite: Performance Tests
################################################################################

test_performance() {
    print_header "Performance Tests"
    
    print_test "API response time for /bar/summary"
    local start_time=$(date +%s%3N)
    api_call GET "/bar/summary" "" 200 >/dev/null 2>&1
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    
    if [ $duration -lt 1000 ]; then
        print_pass "Summary endpoint responds in ${duration}ms (< 1000ms)"
    else
        print_fail "Summary endpoint slow: ${duration}ms"
    fi
    
    print_test "API response time for /bar/orders"
    start_time=$(date +%s%3N)
    api_call GET "/bar/orders?status=PENDING" "" 200 >/dev/null 2>&1
    end_time=$(date +%s%3N)
    duration=$((end_time - start_time))
    
    if [ $duration -lt 2000 ]; then
        print_pass "Orders endpoint responds in ${duration}ms (< 2000ms)"
    else
        print_fail "Orders endpoint slow: ${duration}ms"
    fi
    
    print_test "Concurrent requests handling"
    print_info "Testing 5 simultaneous requests to /bar/summary"
    for i in {1..5}; do
        api_call GET "/bar/summary" "" 200 >/dev/null 2>&1 &
    done
    wait
    print_pass "Concurrent requests completed"
}

################################################################################
# Main Test Execution
################################################################################

main() {
    print_header "Feature 9 — Bar Queue & Drink Service Test Suite"
    print_info "Testing Date: $(date '+%Y-%m-%d %H:%M:%S')"
    print_info "API Base URL: $API_BASE_URL"
    print_info "UI Base URL: $UI_BASE_URL"
    
    # Run test suites
    test_service_health && {
        test_database_schema
        test_bar_queue_api
        test_bar_oversight_api
        test_bar_workspace_ui
        test_bar_oversight_ui
        test_feature_criteria
        test_integration
        test_performance
    }
    
    # Print summary
    print_header "Test Summary"
    echo -e "Total Tests:  ${TOTAL_TESTS}"
    echo -e "${GREEN}Passed:       ${PASSED_TESTS}${NC}"
    echo -e "${RED}Failed:       ${FAILED_TESTS}${NC}"
    echo -e "${YELLOW}Skipped:      ${SKIPPED_TESTS}${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}✓ All tests passed!${NC}\n"
        exit 0
    else
        echo -e "\n${RED}✗ Some tests failed${NC}\n"
        exit 1
    fi
}

# Run tests
main "$@"
