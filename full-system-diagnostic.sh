#!/bin/bash

# Full System Diagnostic Script
# Checks: Database, API, Endpoints, Frontend

echo "=========================================="
echo "FULL SYSTEM DIAGNOSTIC"
echo "=========================================="
echo ""
echo "Date: $(date)"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_BASE="http://localhost:3001"
UI_BASE="http://localhost:3000"

PASSED=0
FAILED=0
WARNINGS=0

# ============================================
# PART 1: DATABASE CHECKS
# ============================================
echo "=========================================="
echo "PART 1: DATABASE DIAGNOSTIC"
echo "=========================================="
echo ""

echo "1.1 Checking Database Connection..."
cd /home/the-macharias/MeatLovers/meetlovers/api

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✓ .env file exists${NC}"
    PASSED=$((PASSED + 1))
    
    # Check database URL
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✓ DATABASE_URL configured${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ DATABASE_URL not found in .env${NC}"
        FAILED=$((FAILED + 1))
    fi
fi

echo ""
echo "1.2 Checking Prisma Schema..."
if [ -f prisma/schema.prisma ]; then
    echo -e "${GREEN}✓ Prisma schema exists${NC}"
    PASSED=$((PASSED + 1))
    
    # Count models
    MODEL_COUNT=$(grep -c "^model " prisma/schema.prisma)
    echo "  → Found $MODEL_COUNT models"
    
    # Check critical models
    for model in "User" "Order" "OrderItem" "Product" "Table"; do
        if grep -q "model $model" prisma/schema.prisma; then
            echo -e "  ${GREEN}✓${NC} $model model exists"
        else
            echo -e "  ${RED}✗${NC} $model model missing"
            FAILED=$((FAILED + 1))
        fi
    done
else
    echo -e "${RED}✗ Prisma schema not found${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "1.3 Testing Database Connection..."
DB_TEST=$(npx prisma db execute --stdin <<< "SELECT 1;" 2>&1)
if echo "$DB_TEST" | grep -q "error"; then
    echo -e "${RED}✗ Database connection failed${NC}"
    echo "$DB_TEST" | grep -i error | head -3
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✓ Database connection successful${NC}"
    PASSED=$((PASSED + 1))
fi

echo ""
echo "1.4 Checking Table Data..."
# Check if tables have data
echo "Checking critical tables..."

# Check Users
USER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM users;" 2>&1 | grep -oP '\d+' | head -1)
if [ -n "$USER_COUNT" ] && [ "$USER_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✓ Users table has $USER_COUNT records${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ Users table is empty or error${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check Products
PRODUCT_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM products;" 2>&1 | grep -oP '\d+' | head -1)
if [ -n "$PRODUCT_COUNT" ] && [ "$PRODUCT_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✓ Products table has $PRODUCT_COUNT records${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ Products table is empty${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check Orders
ORDER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM orders;" 2>&1 | grep -oP '\d+' | head -1)
if [ -n "$ORDER_COUNT" ]; then
    echo -e "${GREEN}✓ Orders table has $ORDER_COUNT records${NC}"
    PASSED=$((PASSED + 1))
    if [ "$ORDER_COUNT" -eq "0" ]; then
        echo -e "  ${YELLOW}→ No orders yet (normal for new system)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Orders table check failed${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# PART 2: API SERVER CHECKS
# ============================================
echo "=========================================="
echo "PART 2: API SERVER DIAGNOSTIC"
echo "=========================================="
echo ""

echo "2.1 Checking if API is running..."
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $API_BASE/health 2>/dev/null)
if [ "$API_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ API server is running (health check: 200)${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ API server not responding (got: $API_HEALTH)${NC}"
    echo "  → Make sure 'npm run start:dev' is running in api folder"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "2.2 Testing Authentication..."
AUTH_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email_or_phone":"admin@meatlovers.com","password":"Admin@1234"}')

if echo "$AUTH_RESPONSE" | grep -q "access_token"; then
    echo -e "${GREEN}✓ Authentication working${NC}"
    PASSED=$((PASSED + 1))
    
    # Extract token
    ADMIN_TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    CHEF_TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email_or_phone":"chef@meatlovers.com","password":"Chef@1234"}' | \
        grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    BARMAN_TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email_or_phone":"barman@meatlovers.com","password":"Barman@1234"}' | \
        grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
else
    echo -e "${RED}✗ Authentication failed${NC}"
    echo "$AUTH_RESPONSE" | head -5
    FAILED=$((FAILED + 1))
fi

echo ""

# ============================================
# PART 3: ENDPOINT TESTS
# ============================================
echo "=========================================="
echo "PART 3: API ENDPOINT TESTS"
echo "=========================================="
echo ""

test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local token=$4
    local expected=$5
    
    if [ -z "$token" ]; then
        status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$API_BASE$endpoint")
    else
        status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token")
    fi
    
    if [ "$status" == "$expected" ]; then
        echo -e "${GREEN}✓${NC} $name - $status"
        PASSED=$((PASSED + 1))
    elif [ "$status" == "500" ]; then
        echo -e "${RED}✗${NC} $name - $status (Internal Server Error)"
        FAILED=$((FAILED + 1))
        
        # Get error details
        if [ -z "$token" ]; then
            response=$(curl -s -X "$method" "$API_BASE$endpoint")
        else
            response=$(curl -s -X "$method" "$API_BASE$endpoint" \
                -H "Authorization: Bearer $token")
        fi
        echo "  → Error: $(echo $response | grep -o '"message":"[^"]*"' | cut -d'"' -f4)"
    elif [ "$status" == "404" ]; then
        echo -e "${YELLOW}⚠${NC} $name - $status (Not Found)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${YELLOW}⚠${NC} $name - Expected: $expected, Got: $status"
        WARNINGS=$((WARNINGS + 1))
    fi
}

echo "3.1 Kitchen Endpoints..."
test_endpoint "Kitchen Queue" "GET" "/kitchen/queue" "$CHEF_TOKEN" "200"
test_endpoint "Kitchen Summary" "GET" "/kitchen/summary" "$CHEF_TOKEN" "200"
test_endpoint "Kitchen Activity" "GET" "/kitchen/activity" "$CHEF_TOKEN" "200"

echo ""
echo "3.2 Bar Endpoints..."
test_endpoint "Bar Queue" "GET" "/bar/queue" "$BARMAN_TOKEN" "200"
test_endpoint "Bar Summary" "GET" "/bar/summary" "$BARMAN_TOKEN" "200"

echo ""
echo "3.3 Product Endpoints..."
test_endpoint "Get Products" "GET" "/products" "$ADMIN_TOKEN" "200"
test_endpoint "Get Categories" "GET" "/products/categories" "$ADMIN_TOKEN" "200"

echo ""
echo "3.4 Order Endpoints..."
test_endpoint "Get Orders" "GET" "/orders" "$ADMIN_TOKEN" "200"
test_endpoint "Get Active Orders" "GET" "/orders/active" "$ADMIN_TOKEN" "200"

echo ""
echo "3.5 Stock Endpoints..."
test_endpoint "Get Stock" "GET" "/stock" "$ADMIN_TOKEN" "200"

echo ""
echo "3.6 Supplier Endpoints..."
test_endpoint "Get Suppliers" "GET" "/suppliers" "$ADMIN_TOKEN" "200"

echo ""

# ============================================
# PART 4: FRONTEND CHECKS
# ============================================
echo "=========================================="
echo "PART 4: FRONTEND DIAGNOSTIC"
echo "=========================================="
echo ""

echo "4.1 Checking if Frontend is running..."
UI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $UI_BASE 2>/dev/null)
if [ "$UI_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Frontend server is running${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ Frontend server not responding (got: $UI_STATUS)${NC}"
    echo "  → Make sure 'npm run dev' is running in ui folder"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "4.2 Testing Frontend Routes..."
test_ui_route() {
    local name=$1
    local route=$2
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$UI_BASE$route" 2>/dev/null)
    
    if [ "$status" == "200" ]; then
        echo -e "${GREEN}✓${NC} $name - $status"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗${NC} $name - $status"
        FAILED=$((FAILED + 1))
    fi
}

test_ui_route "Homepage" "/"
test_ui_route "Login Page" "/login"
test_ui_route "Admin Dashboard" "/admin"
test_ui_route "Manager Dashboard" "/manager"
test_ui_route "Kitchen Dashboard" "/kitchen"
test_ui_route "Bar Dashboard" "/bar"

echo ""

# ============================================
# PART 5: CRITICAL ERRORS
# ============================================
echo "=========================================="
echo "PART 5: CRITICAL ERROR CHECK"
echo "=========================================="
echo ""

echo "5.1 Checking for 500 errors..."
ERRORS_FOUND=0

# Test all critical endpoints for 500 errors
if [ -n "$CHEF_TOKEN" ]; then
    KITCHEN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $CHEF_TOKEN" "$API_BASE/kitchen/queue")
    if [ "$KITCHEN_STATUS" == "500" ]; then
        echo -e "${RED}✗ Kitchen Queue returns 500${NC}"
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
    fi
fi

if [ -n "$BARMAN_TOKEN" ]; then
    BAR_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $BARMAN_TOKEN" "$API_BASE/bar/queue")
    if [ "$BAR_STATUS" == "500" ]; then
        echo -e "${RED}✗ Bar Queue returns 500${NC}"
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
    fi
fi

if [ "$ERRORS_FOUND" -eq "0" ]; then
    echo -e "${GREEN}✓ No 500 errors found${NC}"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}Found $ERRORS_FOUND critical 500 errors${NC}"
    FAILED=$((FAILED + $ERRORS_FOUND))
fi

echo ""

# ============================================
# SUMMARY
# ============================================
echo "=========================================="
echo "DIAGNOSTIC SUMMARY"
echo "=========================================="
echo ""
echo -e "Total Checks: $((PASSED + FAILED + WARNINGS))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ "$FAILED" -eq "0" ]; then
    echo -e "${GREEN}✓ System is healthy!${NC}"
    exit 0
else
    echo -e "${RED}✗ System has $FAILED critical issues${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. Make sure both servers are running:"
    echo "   - API: cd api && npm run start:dev"
    echo "   - UI: cd ui && npm run dev"
    echo "2. Check database connection in api/.env"
    echo "3. Run: cd api && npx prisma generate"
    echo "4. Restart API server after Prisma changes"
    exit 1
fi
