#!/bin/bash

# Security Testing Script for Meat Lovers CIMS
# Date: August 6, 2026

API_URL="http://localhost:3000"
RESULTS_FILE="security-test-results.txt"

echo "====================================" | tee $RESULTS_FILE
echo "Security Testing - Meat Lovers CIMS" | tee -a $RESULTS_FILE
echo "Date: $(date)" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0
TOTAL=0

# Helper function for test results
test_result() {
    TOTAL=$((TOTAL + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2" | tee -a $RESULTS_FILE
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $2" | tee -a $RESULTS_FILE
        FAILED=$((FAILED + 1))
    fi
}

echo "====================================
" | tee -a $RESULTS_FILE
echo "1. AUTHENTICATION SECURITY TESTS" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE

# Test 1: Login with invalid credentials
echo -n "Testing invalid credentials..." | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid@example.com","password":"wrongpassword"}')
[ "$RESPONSE" = "401" ]
test_result $? "Invalid credentials should return 401"

# Test 2: Login without credentials
echo -n "Testing login without credentials..." | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{}')
[ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "401" ]
test_result $? "Empty credentials should return 400/401"

# Test 3: SQL Injection attempt in login
echo -n "Testing SQL injection in login..." | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin' OR '1'='1\",\"password\":\"' OR '1'='1\"}")
[ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "401" ]
test_result $? "SQL injection should be rejected"

# Test 4: Access protected endpoint without token
echo -n "Testing access without authentication..." | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/orders")
[ "$RESPONSE" = "401" ]
test_result $? "Protected endpoint should require auth"

# Test 5: Access with invalid token
echo -n "Testing access with invalid token..." | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/orders" \
  -H "Authorization: Bearer invalid.token.here")
[ "$RESPONSE" = "401" ]
test_result $? "Invalid token should be rejected"

echo "" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE
echo "2. RATE LIMITING TESTS" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE

# Test 6: Rate limiting on login
echo -n "Testing rate limiting on login..." | tee -a $RESULTS_FILE
LIMIT_TRIGGERED=0
for i in {1..10}; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"email":"test@example.com","password":"password"}')
    if [ "$RESPONSE" = "429" ]; then
        LIMIT_TRIGGERED=1
        break
    fi
    sleep 0.1
done
[ $LIMIT_TRIGGERED -eq 1 ]
test_result $? "Rate limiting should trigger after multiple attempts"

echo "" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE
echo "3. INPUT VALIDATION TESTS" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE

# Test 7: XSS in input fields
echo -n "Testing XSS protection..." | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(\"XSS\")</script>","password":"test"}')
echo "$RESPONSE" | grep -q "<script>" && RESULT=1 || RESULT=0
[ $RESULT -eq 0 ]
test_result $? "XSS scripts should be sanitized"

# Test 8: Extremely long input
echo -n "Testing input length validation..." | tee -a $RESULTS_FILE
LONG_STRING=$(python3 -c "print('A' * 10000)")
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$LONG_STRING\",\"password\":\"test\"}")
[ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "413" ]
test_result $? "Excessively long input should be rejected"

echo "" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE
echo "4. API SECURITY HEADERS" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE

# Test 9: Check for security headers
echo -n "Testing security headers presence..." | tee -a $RESULTS_FILE
HEADERS=$(curl -s -I "$API_URL/health")
echo "$HEADERS" | grep -iq "x-frame-options" && FRAME_OPTIONS=1 || FRAME_OPTIONS=0
echo "$HEADERS" | grep -iq "x-content-type-options" && CONTENT_TYPE=1 || CONTENT_TYPE=0
[ $FRAME_OPTIONS -eq 1 ] && [ $CONTENT_TYPE -eq 1 ]
test_result $? "Security headers should be present"

echo "" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE
echo "5. DATA EXPOSURE TESTS" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE

# Test 10: Check if sensitive data is exposed in errors
echo -n "Testing error message security..." | tee -a $RESULTS_FILE
ERROR_RESPONSE=$(curl -s -X GET "$API_URL/nonexistent-endpoint")
echo "$ERROR_RESPONSE" | grep -iq "stack" && STACK_EXPOSED=1 || STACK_EXPOSED=0
echo "$ERROR_RESPONSE" | grep -iq "password" && PASSWORD_EXPOSED=1 || PASSWORD_EXPOSED=0
[ $STACK_EXPOSED -eq 0 ] && [ $PASSWORD_EXPOSED -eq 0 ]
test_result $? "Error messages should not expose sensitive data"

echo "" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE
echo "6. HTTP METHOD TESTS" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE

# Test 11: Verify inappropriate HTTP methods are blocked
echo -n "Testing HTTP method restrictions..." | tee -a $RESULTS_FILE
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X TRACE "$API_URL/health")
[ "$RESPONSE" = "405" ] || [ "$RESPONSE" = "404" ]
test_result $? "Dangerous HTTP methods should be blocked"

echo "" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE
echo "7. CORS CONFIGURATION TESTS" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE

# Test 12: CORS headers present
echo -n "Testing CORS configuration..." | tee -a $RESULTS_FILE
CORS_RESPONSE=$(curl -s -I "$API_URL/health" -H "Origin: http://example.com")
echo "$CORS_RESPONSE" | grep -iq "access-control-allow-origin" && CORS_PRESENT=1 || CORS_PRESENT=0
[ $CORS_PRESENT -eq 1 ]
test_result $? "CORS headers should be configured"

echo "" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE
echo "TEST SUMMARY" | tee -a $RESULTS_FILE
echo "====================================" | tee -a $RESULTS_FILE
echo "Total Tests: $TOTAL" | tee -a $RESULTS_FILE
echo -e "${GREEN}Passed: $PASSED${NC}" | tee -a $RESULTS_FILE
echo -e "${RED}Failed: $FAILED${NC}" | tee -a $RESULTS_FILE
PASS_RATE=$((PASSED * 100 / TOTAL))
echo "Pass Rate: $PASS_RATE%" | tee -a $RESULTS_FILE
echo "" | tee -a $RESULTS_FILE

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All security tests passed!${NC}" | tee -a $RESULTS_FILE
    exit 0
else
    echo -e "${YELLOW}⚠ Some security tests failed. Please review.${NC}" | tee -a $RESULTS_FILE
    exit 1
fi
