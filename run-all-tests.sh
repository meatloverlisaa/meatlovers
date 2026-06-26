#!/bin/bash
# Run all Feature 2 and Feature 3 tests

echo "=========================================="
echo "MEAT LOVERS CIMS - COMPREHENSIVE TEST SUITE"
echo "Running Feature 2 & Feature 3 Tests"
echo "=========================================="
echo ""

API_URL="http://localhost:3001"
TOTAL_PASS=0
TOTAL_FAIL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "FEATURE 2: WEBSITE & CUSTOMER ACQUISITION"
echo "=========================================="
echo ""

# Test 1: Homepage endpoint
echo "Test 1: Homepage endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/website/home")
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Homepage returns 200 OK"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Homepage returned $RESPONSE"
    ((TOTAL_FAIL++))
fi

# Test 2: Menu highlights endpoint
echo "Test 2: Menu highlights endpoint..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/website/menu-highlights")
if [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Menu highlights returns 200 OK"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Menu highlights returned $RESPONSE"
    ((TOTAL_FAIL++))
fi

# Test 3: Lead capture endpoint
echo "Test 3: Lead capture endpoint..."
LEAD_DATA='{"name":"Test User","email":"test@example.com","phone":"0712345678","source":"LANDING_PAGE","message":"Test"}'
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/website/leads" \
  -H "Content-Type: application/json" -d "$LEAD_DATA")
if [ "$RESPONSE" = "201" ] || [ "$RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Lead capture returns $RESPONSE"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Lead capture returned $RESPONSE"
    ((TOTAL_FAIL++))
fi

# Test 4: CMS requires auth
echo "Test 4: CMS requires authentication..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/cms/pages")
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC}: CMS returns 401 (auth required)"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: CMS returned $RESPONSE (expected 401)"
    ((TOTAL_FAIL++))
fi

# Test 5: CRM requires auth
echo "Test 5: CRM requires authentication..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/crm/leads")
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC}: CRM returns 401 (auth required)"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: CRM returned $RESPONSE (expected 401)"
    ((TOTAL_FAIL++))
fi

# Test 6: Database migration
echo "Test 6: Database migration status..."
cd api
MIGRATION_STATUS=$(npx prisma migrate status 2>&1)
cd ..
if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo -e "${GREEN}✅ PASS${NC}: Migrations up to date"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Migration issues detected"
    ((TOTAL_FAIL++))
fi

# Test 7: Website module exists
echo "Test 7: Website module files..."
if [ -f "api/src/website/website.controller.ts" ] && [ -f "api/src/website/website.service.ts" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Website module files exist"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Website module files missing"
    ((TOTAL_FAIL++))
fi

# Test 8: CMS module exists
echo "Test 8: CMS module files..."
if [ -f "api/src/cms/cms.controller.ts" ] && [ -f "api/src/cms/cms.service.ts" ]; then
    echo -e "${GREEN}✅ PASS${NC}: CMS module files exist"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: CMS module files missing"
    ((TOTAL_FAIL++))
fi

# Test 9: CRM module exists
echo "Test 9: CRM module files..."
if [ -f "api/src/crm/crm.controller.ts" ] && [ -f "api/src/crm/crm.service.ts" ]; then
    echo -e "${GREEN}✅ PASS${NC}: CRM module files exist"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: CRM module files missing"
    ((TOTAL_FAIL++))
fi

# Test 10: Schema has required models
echo "Test 10: Database schema models..."
if grep -q "model ContentPage" api/prisma/schema.prisma && \
   grep -q "model WebsiteLead" api/prisma/schema.prisma; then
    echo -e "${GREEN}✅ PASS${NC}: Required models in schema"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Required models missing from schema"
    ((TOTAL_FAIL++))
fi

echo ""
echo "=========================================="
echo "FEATURE 3: ADMIN DASHBOARD"
echo "=========================================="
echo ""

# Test 11: Admin dashboard summary requires auth
echo "Test 11: Admin dashboard summary auth..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/admin/dashboard/summary")
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Dashboard summary returns 401 (auth required)"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Dashboard summary returned $RESPONSE"
    ((TOTAL_FAIL++))
fi

# Test 12: Admin dashboard activity requires auth
echo "Test 12: Admin dashboard activity auth..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/admin/dashboard/activity")
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Dashboard activity returns 401 (auth required)"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Dashboard activity returned $RESPONSE"
    ((TOTAL_FAIL++))
fi

# Test 13: Admin dashboard alerts requires auth
echo "Test 13: Admin dashboard alerts auth..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/admin/dashboard/alerts")
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Dashboard alerts returns 401 (auth required)"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Dashboard alerts returned $RESPONSE"
    ((TOTAL_FAIL++))
fi

# Test 14: Staff dashboard summary requires auth
echo "Test 14: Staff dashboard summary auth..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/staff/dashboard/summary")
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Staff summary returns 401 (auth required)"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Staff summary returned $RESPONSE"
    ((TOTAL_FAIL++))
fi

# Test 15: Staff dashboard tasks requires auth
echo "Test 15: Staff dashboard tasks auth..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/staff/dashboard/tasks")
if [ "$RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Staff tasks returns 401 (auth required)"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Staff tasks returned $RESPONSE"
    ((TOTAL_FAIL++))
fi

# Test 16: Admin dashboard module exists
echo "Test 16: Admin dashboard module files..."
if [ -f "api/src/admin-dashboard/admin-dashboard.controller.ts" ] && \
   [ -f "api/src/admin-dashboard/admin-dashboard.service.ts" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Admin dashboard module files exist"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Admin dashboard module files missing"
    ((TOTAL_FAIL++))
fi

# Test 17: Staff dashboard module exists
echo "Test 17: Staff dashboard module files..."
if [ -f "api/src/staff-dashboard/staff-dashboard.controller.ts" ] && \
   [ -f "api/src/staff-dashboard/staff-dashboard.service.ts" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Staff dashboard module files exist"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Staff dashboard module files missing"
    ((TOTAL_FAIL++))
fi

# Test 18: Admin UI layout exists
echo "Test 18: Admin UI layout..."
if [ -f "ui/src/app/admin/layout.tsx" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Admin layout exists"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Admin layout missing"
    ((TOTAL_FAIL++))
fi

# Test 19: Admin UI dashboard page exists
echo "Test 19: Admin dashboard page..."
if [ -f "ui/src/app/admin/page.tsx" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Admin dashboard page exists"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Admin dashboard page missing"
    ((TOTAL_FAIL++))
fi

# Test 20: Staff UI layout exists
echo "Test 20: Staff UI layout..."
if [ -f "ui/src/app/staff/layout.tsx" ]; then
    echo -e "${GREEN}✅ PASS${NC}: Staff layout exists"
    ((TOTAL_PASS++))
else
    echo -e "${RED}❌ FAIL${NC}: Staff layout missing"
    ((TOTAL_FAIL++))
fi

echo ""
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo ""
TOTAL=$((TOTAL_PASS + TOTAL_FAIL))
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $TOTAL_PASS${NC}"
echo -e "${RED}Failed: $TOTAL_FAIL${NC}"
echo ""

if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((TOTAL_PASS * 100 / TOTAL))
else
    PERCENTAGE=0
fi
echo "Success Rate: $PERCENTAGE%"
echo ""

if [ $TOTAL_FAIL -eq 0 ]; then
    echo -e "${GREEN}=========================================="
    echo "✅ ALL TESTS PASSED!"
    echo -e "==========================================${NC}"
    exit 0
else
    echo -e "${RED}=========================================="
    echo "❌ $TOTAL_FAIL TEST(S) FAILED"
    echo -e "==========================================${NC}"
    exit 1
fi
