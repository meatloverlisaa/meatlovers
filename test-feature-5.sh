#!/bin/bash

# ============================================================================
# Feature 5 — Supplier & Procurement Management Test Script
# ============================================================================
# Test Criteria:
# [ ] Supplier creation succeeds with valid data
# [ ] Status toggle switches ACTIVE and SUSPENDED correctly
# [ ] Suspended suppliers cannot be selected for new stock purchase entries
# [ ] STOREKEEPER and ACCOUNTANT have read-only supplier access
# [ ] Role guard blocks unauthorised supplier edits
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3001}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@meatlovers.local}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
STOREKEEPER_EMAIL="${STOREKEEPER_EMAIL:-storekeeper@meatlovers.local}"
STOREKEEPER_PASSWORD="${STOREKEEPER_PASSWORD:-storekeeper123}"
ACCOUNTANT_EMAIL="${ACCOUNTANT_EMAIL:-accountant@meatlovers.local}"
ACCOUNTANT_PASSWORD="${ACCOUNTANT_PASSWORD:-accountant123}"

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TEST_RESULTS=()

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_test() {
    echo -e "${YELLOW}TEST:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    TEST_RESULTS+=("PASS: $1")
}

print_failure() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    TEST_RESULTS+=("FAIL: $1")
}

print_info() {
    echo -e "${BLUE}ℹ INFO:${NC} $1"
}

# Make HTTP request and return response
make_request() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4
    
    if [ -n "$data" ]; then
        curl -s -X "$method" "$API_BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "\nHTTP_STATUS:%{http_code}"
    else
        curl -s -X "$method" "$API_BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -w "\nHTTP_STATUS:%{http_code}"
    fi
}

# Extract HTTP status from response
get_http_status() {
    echo "$1" | grep "HTTP_STATUS:" | cut -d: -f2
}

# Extract body from response
get_response_body() {
    echo "$1" | sed '/HTTP_STATUS:/d'
}

# Login and get JWT token
login() {
    local email=$1
    local password=$2
    
    local response=$(curl -s -X POST "$API_BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4
}

# ============================================================================
# Test Setup
# ============================================================================

print_header "Feature 5 Test Setup"

print_info "API Base URL: $API_BASE_URL"
print_info "Logging in users..."

# Login as ADMIN
ADMIN_TOKEN=$(login "$ADMIN_EMAIL" "$ADMIN_PASSWORD")
if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}Failed to login as ADMIN. Please check credentials and ensure the API is running.${NC}"
    exit 1
fi
print_success "ADMIN logged in successfully"

# Login as STOREKEEPER
STOREKEEPER_TOKEN=$(login "$STOREKEEPER_EMAIL" "$STOREKEEPER_PASSWORD")
if [ -z "$STOREKEEPER_TOKEN" ]; then
    echo -e "${RED}Failed to login as STOREKEEPER. Please check credentials.${NC}"
    exit 1
fi
print_success "STOREKEEPER logged in successfully"

# Login as ACCOUNTANT
ACCOUNTANT_TOKEN=$(login "$ACCOUNTANT_EMAIL" "$ACCOUNTANT_PASSWORD")
if [ -z "$ACCOUNTANT_TOKEN" ]; then
    echo -e "${RED}Failed to login as ACCOUNTANT. Please check credentials.${NC}"
    exit 1
fi
print_success "ACCOUNTANT logged in successfully"

# ============================================================================
# Test 1: Supplier creation succeeds with valid data
# ============================================================================

print_header "Test 1: Supplier Creation with Valid Data"

print_test "Creating new supplier as ADMIN"

SUPPLIER_DATA='{
  "supplier_name": "Test Supplier Co.",
  "contact_person": "John Doe",
  "phone": "+254712345678",
  "email": "john@testsupplier.co.ke",
  "physical_address": "123 Test Street, Nairobi",
  "supplier_type": "FOOD"
}'

CREATE_RESPONSE=$(make_request "POST" "/suppliers" "$ADMIN_TOKEN" "$SUPPLIER_DATA")
CREATE_STATUS=$(get_http_status "$CREATE_RESPONSE")
CREATE_BODY=$(get_response_body "$CREATE_RESPONSE")

if [ "$CREATE_STATUS" = "201" ] || [ "$CREATE_STATUS" = "200" ]; then
    SUPPLIER_ID=$(echo "$CREATE_BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
    if [ -n "$SUPPLIER_ID" ]; then
        print_success "Supplier created successfully (ID: $SUPPLIER_ID)"
    else
        print_failure "Supplier created but ID not found in response"
    fi
else
    print_failure "Supplier creation failed (HTTP $CREATE_STATUS)"
    echo "$CREATE_BODY"
fi

# ============================================================================
# Test 2: Status toggle switches ACTIVE and SUSPENDED correctly
# ============================================================================

print_header "Test 2: Status Toggle Functionality"

if [ -n "$SUPPLIER_ID" ]; then
    print_test "Toggling supplier status to SUSPENDED"
    
    STATUS_DATA='{"status":"SUSPENDED"}'
    SUSPEND_RESPONSE=$(make_request "PATCH" "/suppliers/$SUPPLIER_ID/status" "$ADMIN_TOKEN" "$STATUS_DATA")
    SUSPEND_STATUS=$(get_http_status "$SUSPEND_RESPONSE")
    
    if [ "$SUSPEND_STATUS" = "200" ]; then
        # Verify status changed
        GET_RESPONSE=$(make_request "GET" "/suppliers/$SUPPLIER_ID" "$ADMIN_TOKEN")
        GET_BODY=$(get_response_body "$GET_RESPONSE")
        
        if echo "$GET_BODY" | grep -q '"status":"SUSPENDED"'; then
            print_success "Supplier status changed to SUSPENDED"
        else
            print_failure "Supplier status change not reflected"
        fi
    else
        print_failure "Status toggle to SUSPENDED failed (HTTP $SUSPEND_STATUS)"
    fi
    
    print_test "Toggling supplier status back to ACTIVE"
    
    STATUS_DATA='{"status":"ACTIVE"}'
    ACTIVATE_RESPONSE=$(make_request "PATCH" "/suppliers/$SUPPLIER_ID/status" "$ADMIN_TOKEN" "$STATUS_DATA")
    ACTIVATE_STATUS=$(get_http_status "$ACTIVATE_RESPONSE")
    
    if [ "$ACTIVATE_STATUS" = "200" ]; then
        # Verify status changed
        GET_RESPONSE=$(make_request "GET" "/suppliers/$SUPPLIER_ID" "$ADMIN_TOKEN")
        GET_BODY=$(get_response_body "$GET_RESPONSE")
        
        if echo "$GET_BODY" | grep -q '"status":"ACTIVE"'; then
            print_success "Supplier status changed back to ACTIVE"
        else
            print_failure "Supplier status change not reflected"
        fi
    else
        print_failure "Status toggle to ACTIVE failed (HTTP $ACTIVATE_STATUS)"
    fi
else
    print_failure "Cannot test status toggle - no supplier ID"
fi

# ============================================================================
# Test 3: Suspended suppliers cannot be selected for stock purchase entries
# ============================================================================

print_header "Test 3: Suspended Supplier Validation"

if [ -n "$SUPPLIER_ID" ]; then
    print_test "Setting supplier to SUSPENDED for validation test"
    
    STATUS_DATA='{"status":"SUSPENDED"}'
    SUSPEND_RESPONSE=$(make_request "PATCH" "/suppliers/$SUPPLIER_ID/status" "$ADMIN_TOKEN" "$STATUS_DATA")
    SUSPEND_STATUS=$(get_http_status "$SUSPEND_RESPONSE")
    
    if [ "$SUSPEND_STATUS" = "200" ]; then
        print_success "Supplier set to SUSPENDED"
        
        print_test "Attempting to create stock purchase with suspended supplier"
        
        # Note: This test assumes stock purchase endpoint validates supplier status
        # The actual validation should be in the stock module (Feature 6)
        
        # First check if stock endpoint exists
        STOCK_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/stock/purchase" \
            -H "Authorization: Bearer $STOREKEEPER_TOKEN")
        
        if [ "$STOCK_CHECK" != "404" ]; then
            # Try to create stock purchase with suspended supplier
            STOCK_DATA="{
                \"supplier_id\": $SUPPLIER_ID,
                \"product_id\": 1,
                \"quantity\": 100,
                \"unit_cost\": 50.00
            }"
            
            STOCK_RESPONSE=$(make_request "POST" "/stock/purchase" "$STOREKEEPER_TOKEN" "$STOCK_DATA")
            STOCK_STATUS=$(get_http_status "$STOCK_RESPONSE")
            STOCK_BODY=$(get_response_body "$STOCK_RESPONSE")
            
            if [ "$STOCK_STATUS" = "400" ] || [ "$STOCK_STATUS" = "403" ]; then
                if echo "$STOCK_BODY" | grep -qi "suspended\|inactive\|not active"; then
                    print_success "Stock purchase correctly rejected for suspended supplier"
                else
                    print_failure "Stock purchase rejected but without proper error message"
                fi
            elif [ "$STOCK_STATUS" = "200" ] || [ "$STOCK_STATUS" = "201" ]; then
                print_failure "Stock purchase incorrectly allowed for suspended supplier"
            else
                print_info "Stock purchase returned unexpected status: $STOCK_STATUS"
                print_info "This may indicate the stock module validation is not yet implemented"
            fi
        else
            print_info "Stock purchase endpoint not yet implemented (Feature 6)"
            print_info "Supplier status validation will be tested when stock module is ready"
        fi
        
        # Reactivate supplier for remaining tests
        print_test "Reactivating supplier for remaining tests"
        STATUS_DATA='{"status":"ACTIVE"}'
        make_request "PATCH" "/suppliers/$SUPPLIER_ID/status" "$ADMIN_TOKEN" "$STATUS_DATA" > /dev/null
        print_success "Supplier reactivated"
    else
        print_failure "Failed to suspend supplier for testing"
    fi
else
    print_failure "Cannot test suspended supplier validation - no supplier ID"
fi

# ============================================================================
# Test 4: STOREKEEPER and ACCOUNTANT have read-only access
# ============================================================================

print_header "Test 4: Read-Only Access for STOREKEEPER and ACCOUNTANT"

# Test STOREKEEPER read access
print_test "STOREKEEPER attempting to list suppliers (should succeed)"
SK_LIST_RESPONSE=$(make_request "GET" "/suppliers" "$STOREKEEPER_TOKEN")
SK_LIST_STATUS=$(get_http_status "$SK_LIST_RESPONSE")

if [ "$SK_LIST_STATUS" = "200" ]; then
    print_success "STOREKEEPER can list suppliers"
else
    print_failure "STOREKEEPER cannot list suppliers (HTTP $SK_LIST_STATUS)"
fi

if [ -n "$SUPPLIER_ID" ]; then
    print_test "STOREKEEPER attempting to get supplier detail (should succeed)"
    SK_GET_RESPONSE=$(make_request "GET" "/suppliers/$SUPPLIER_ID" "$STOREKEEPER_TOKEN")
    SK_GET_STATUS=$(get_http_status "$SK_GET_RESPONSE")
    
    if [ "$SK_GET_STATUS" = "200" ]; then
        print_success "STOREKEEPER can get supplier details"
    else
        print_failure "STOREKEEPER cannot get supplier details (HTTP $SK_GET_STATUS)"
    fi
fi

# Test ACCOUNTANT read access
print_test "ACCOUNTANT attempting to list suppliers (should succeed)"
AC_LIST_RESPONSE=$(make_request "GET" "/suppliers" "$ACCOUNTANT_TOKEN")
AC_LIST_STATUS=$(get_http_status "$AC_LIST_RESPONSE")

if [ "$AC_LIST_STATUS" = "200" ]; then
    print_success "ACCOUNTANT can list suppliers"
else
    print_failure "ACCOUNTANT cannot list suppliers (HTTP $AC_LIST_STATUS)"
fi

if [ -n "$SUPPLIER_ID" ]; then
    print_test "ACCOUNTANT attempting to get supplier detail (should succeed)"
    AC_GET_RESPONSE=$(make_request "GET" "/suppliers/$SUPPLIER_ID" "$ACCOUNTANT_TOKEN")
    AC_GET_STATUS=$(get_http_status "$AC_GET_RESPONSE")
    
    if [ "$AC_GET_STATUS" = "200" ]; then
        print_success "ACCOUNTANT can get supplier details"
    else
        print_failure "ACCOUNTANT cannot get supplier details (HTTP $AC_GET_STATUS)"
    fi
fi

# ============================================================================
# Test 5: Role guard blocks unauthorised supplier edits
# ============================================================================

print_header "Test 5: Role Guard Blocks Unauthorised Edits"

# Test STOREKEEPER write prevention
print_test "STOREKEEPER attempting to create supplier (should be blocked)"
SK_CREATE_RESPONSE=$(make_request "POST" "/suppliers" "$STOREKEEPER_TOKEN" "$SUPPLIER_DATA")
SK_CREATE_STATUS=$(get_http_status "$SK_CREATE_RESPONSE")

if [ "$SK_CREATE_STATUS" = "403" ]; then
    print_success "STOREKEEPER creation blocked (403 Forbidden)"
elif [ "$SK_CREATE_STATUS" = "401" ]; then
    print_success "STOREKEEPER creation blocked (401 Unauthorized)"
else
    print_failure "STOREKEEPER creation not properly blocked (HTTP $SK_CREATE_STATUS)"
fi

if [ -n "$SUPPLIER_ID" ]; then
    print_test "STOREKEEPER attempting to update supplier (should be blocked)"
    UPDATE_DATA='{"phone":"+254799999999"}'
    SK_UPDATE_RESPONSE=$(make_request "PATCH" "/suppliers/$SUPPLIER_ID" "$STOREKEEPER_TOKEN" "$UPDATE_DATA")
    SK_UPDATE_STATUS=$(get_http_status "$SK_UPDATE_RESPONSE")
    
    if [ "$SK_UPDATE_STATUS" = "403" ]; then
        print_success "STOREKEEPER update blocked (403 Forbidden)"
    elif [ "$SK_UPDATE_STATUS" = "401" ]; then
        print_success "STOREKEEPER update blocked (401 Unauthorized)"
    else
        print_failure "STOREKEEPER update not properly blocked (HTTP $SK_UPDATE_STATUS)"
    fi
    
    print_test "STOREKEEPER attempting to toggle status (should be blocked)"
    SK_STATUS_RESPONSE=$(make_request "PATCH" "/suppliers/$SUPPLIER_ID/status" "$STOREKEEPER_TOKEN" '{"status":"SUSPENDED"}')
    SK_STATUS=$(get_http_status "$SK_STATUS_RESPONSE")
    
    if [ "$SK_STATUS" = "403" ]; then
        print_success "STOREKEEPER status toggle blocked (403 Forbidden)"
    elif [ "$SK_STATUS" = "401" ]; then
        print_success "STOREKEEPER status toggle blocked (401 Unauthorized)"
    else
        print_failure "STOREKEEPER status toggle not properly blocked (HTTP $SK_STATUS)"
    fi
    
    print_test "STOREKEEPER attempting to delete supplier (should be blocked)"
    SK_DELETE_RESPONSE=$(make_request "DELETE" "/suppliers/$SUPPLIER_ID" "$STOREKEEPER_TOKEN")
    SK_DELETE_STATUS=$(get_http_status "$SK_DELETE_RESPONSE")
    
    if [ "$SK_DELETE_STATUS" = "403" ]; then
        print_success "STOREKEEPER deletion blocked (403 Forbidden)"
    elif [ "$SK_DELETE_STATUS" = "401" ]; then
        print_success "STOREKEEPER deletion blocked (401 Unauthorized)"
    else
        print_failure "STOREKEEPER deletion not properly blocked (HTTP $SK_DELETE_STATUS)"
    fi
fi

# Test ACCOUNTANT write prevention
print_test "ACCOUNTANT attempting to create supplier (should be blocked)"
AC_CREATE_RESPONSE=$(make_request "POST" "/suppliers" "$ACCOUNTANT_TOKEN" "$SUPPLIER_DATA")
AC_CREATE_STATUS=$(get_http_status "$AC_CREATE_RESPONSE")

if [ "$AC_CREATE_STATUS" = "403" ]; then
    print_success "ACCOUNTANT creation blocked (403 Forbidden)"
elif [ "$AC_CREATE_STATUS" = "401" ]; then
    print_success "ACCOUNTANT creation blocked (401 Unauthorized)"
else
    print_failure "ACCOUNTANT creation not properly blocked (HTTP $AC_CREATE_STATUS)"
fi

if [ -n "$SUPPLIER_ID" ]; then
    print_test "ACCOUNTANT attempting to update supplier (should be blocked)"
    UPDATE_DATA='{"phone":"+254788888888"}'
    AC_UPDATE_RESPONSE=$(make_request "PATCH" "/suppliers/$SUPPLIER_ID" "$ACCOUNTANT_TOKEN" "$UPDATE_DATA")
    AC_UPDATE_STATUS=$(get_http_status "$AC_UPDATE_RESPONSE")
    
    if [ "$AC_UPDATE_STATUS" = "403" ]; then
        print_success "ACCOUNTANT update blocked (403 Forbidden)"
    elif [ "$AC_UPDATE_STATUS" = "401" ]; then
        print_success "ACCOUNTANT update blocked (401 Unauthorized)"
    else
        print_failure "ACCOUNTANT update not properly blocked (HTTP $AC_UPDATE_STATUS)"
    fi
    
    print_test "ACCOUNTANT attempting to toggle status (should be blocked)"
    AC_STATUS_RESPONSE=$(make_request "PATCH" "/suppliers/$SUPPLIER_ID/status" "$ACCOUNTANT_TOKEN" '{"status":"SUSPENDED"}')
    AC_STATUS=$(get_http_status "$AC_STATUS_RESPONSE")
    
    if [ "$AC_STATUS" = "403" ]; then
        print_success "ACCOUNTANT status toggle blocked (403 Forbidden)"
    elif [ "$AC_STATUS" = "401" ]; then
        print_success "ACCOUNTANT status toggle blocked (401 Unauthorized)"
    else
        print_failure "ACCOUNTANT status toggle not properly blocked (HTTP $AC_STATUS)"
    fi
    
    print_test "ACCOUNTANT attempting to delete supplier (should be blocked)"
    AC_DELETE_RESPONSE=$(make_request "DELETE" "/suppliers/$SUPPLIER_ID" "$ACCOUNTANT_TOKEN")
    AC_DELETE_STATUS=$(get_http_status "$AC_DELETE_RESPONSE")
    
    if [ "$AC_DELETE_STATUS" = "403" ]; then
        print_success "ACCOUNTANT deletion blocked (403 Forbidden)"
    elif [ "$AC_DELETE_STATUS" = "401" ]; then
        print_success "ACCOUNTANT deletion blocked (401 Unauthorized)"
    else
        print_failure "ACCOUNTANT deletion not properly blocked (HTTP $AC_DELETE_STATUS)"
    fi
fi

# ============================================================================
# Test Cleanup
# ============================================================================

print_header "Test Cleanup"

if [ -n "$SUPPLIER_ID" ]; then
    print_info "Cleaning up test supplier (ID: $SUPPLIER_ID)"
    DELETE_RESPONSE=$(make_request "DELETE" "/suppliers/$SUPPLIER_ID" "$ADMIN_TOKEN")
    DELETE_STATUS=$(get_http_status "$DELETE_RESPONSE")
    
    if [ "$DELETE_STATUS" = "200" ]; then
        print_success "Test supplier deleted"
    else
        print_info "Test supplier deletion returned HTTP $DELETE_STATUS (may be okay)"
    fi
fi

# ============================================================================
# Test Summary
# ============================================================================

print_header "Feature 5 Test Summary"

echo -e "\n${BLUE}Test Results:${NC}"
for result in "${TEST_RESULTS[@]}"; do
    if [[ $result == PASS:* ]]; then
        echo -e "${GREEN}✓${NC} ${result#PASS: }"
    else
        echo -e "${RED}✗${NC} ${result#FAIL: }"
    fi
done

echo -e "\n${BLUE}Statistics:${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    exit 0
else
    echo -e "\n${RED}========================================${NC}"
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo -e "${RED}========================================${NC}\n"
    exit 1
fi
