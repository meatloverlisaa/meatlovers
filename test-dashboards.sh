#!/bin/bash

# Dashboard Testing Script
# Tests all dashboard endpoints without authentication

API_URL="http://localhost:3001"

echo "============================================"
echo "Meat Lovers CIMS - Dashboard Testing Report"
echo "============================================"
echo ""
echo "Testing Date: $(date)"
echo "API URL: $API_URL"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local name="$1"
    local endpoint="$2"
    local expected_auth="$3"
    
    echo -n "Testing: $name ... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint" 2>&1)
    
    if [ "$response" = "401" ] || [ "$response" = "403" ]; then
        if [ "$expected_auth" = "yes" ]; then
            echo -e "${GREEN}✓ Protected (requires auth)${NC}"
            return 0
        else
            echo -e "${RED}✗ Should be public but requires auth${NC}"
            return 1
        fi
    elif [ "$response" = "200" ]; then
        if [ "$expected_auth" = "yes" ]; then
            echo -e "${YELLOW}⚠ Should be protected but is open${NC}"
            return 2
        else
            echo -e "${GREEN}✓ OK${NC}"
            return 0
        fi
    elif [ "$response" = "404" ]; then
        echo -e "${RED}✗ Not Found (endpoint missing)${NC}"
        return 1
    else
        echo -e "${RED}✗ Error (HTTP $response)${NC}"
        return 1
    fi
}

echo "1. ADMIN DASHBOARD"
echo "-------------------"
test_endpoint "Admin Summary" "/admin/dashboard/summary" "yes"
test_endpoint "Admin Activity" "/admin/dashboard/activity" "yes"
test_endpoint "Admin Alerts" "/admin/dashboard/alerts" "yes"
echo ""

echo "2. STAFF DASHBOARD"
echo "-------------------"
test_endpoint "Staff Summary" "/staff/dashboard/summary" "yes"
test_endpoint "Staff Tasks" "/staff/dashboard/tasks" "yes"
echo ""

echo "3. KITCHEN DASHBOARD"
echo "---------------------"
test_endpoint "Kitchen Summary" "/kitchen/summary" "yes"
test_endpoint "Kitchen Pending Orders" "/kitchen/orders?status=PENDING" "yes"
echo ""

echo "4. BAR DASHBOARD"
echo "-----------------"
test_endpoint "Bar Summary" "/bar/summary" "yes"
test_endpoint "Bar Pending Orders" "/bar/orders?status=PENDING" "yes"
echo ""

echo "5. POS DASHBOARD"
echo "-----------------"
test_endpoint "POS Orders" "/pos/orders" "yes"
echo ""

echo "6. DELIVERIES DASHBOARD"
echo "------------------------"
test_endpoint "Deliveries Summary" "/deliveries/summary" "yes"
test_endpoint "Deliveries List" "/deliveries" "yes"
echo ""

echo "7. MANAGER-SPECIFIC ROUTES"
echo "----------------------------"
test_endpoint "Manager CMS Pages" "/manager/cms/pages" "yes"
test_endpoint "Manager CMS Stats" "/manager/cms/stats" "yes"
test_endpoint "Manager Products" "/manager/products" "yes"
test_endpoint "Manager Products Stats" "/manager/products/stats/overview" "yes"
test_endpoint "Manager Suppliers" "/manager/suppliers" "yes"
test_endpoint "Manager Suppliers Stats" "/manager/suppliers/stats" "yes"
test_endpoint "Manager Stock" "/manager/stock" "yes"
test_endpoint "Manager Stock Stats" "/manager/stock/stats" "yes"
test_endpoint "Manager Orders" "/manager/orders" "yes"
test_endpoint "Manager Orders Stats" "/manager/orders/stats" "yes"
echo ""

echo "8. CORE API HEALTH"
echo "-------------------"
test_endpoint "API Root" "/" "no"
test_endpoint "Health Check" "/health" "no"
echo ""

echo "9. DATABASE CONNECTIVITY"
echo "-------------------------"
echo -n "Checking database connection ... "
if mysql -u meat_lovers_user -pStrongLocalPassword -h 127.0.0.1 meat_lovers_cims -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Failed${NC}"
fi
echo ""

echo "10. DATA AVAILABILITY"
echo "----------------------"
echo -n "Checking users ... "
user_count=$(mysql -u meat_lovers_user -pStrongLocalPassword -h 127.0.0.1 meat_lovers_cims -se "SELECT COUNT(*) FROM users;" 2>/dev/null)
echo -e "${GREEN}$user_count users${NC}"

echo -n "Checking orders ... "
order_count=$(mysql -u meat_lovers_user -pStrongLocalPassword -h 127.0.0.1 meat_lovers_cims -se "SELECT COUNT(*) FROM orders;" 2>/dev/null)
echo -e "${GREEN}$order_count orders${NC}"

echo -n "Checking products ... "
product_count=$(mysql -u meat_lovers_user -pStrongLocalPassword -h 127.0.0.1 meat_lovers_cims -se "SELECT COUNT(*) FROM products;" 2>/dev/null)
echo -e "${GREEN}$product_count products${NC}"

echo -n "Checking stock items ... "
stock_count=$(mysql -u meat_lovers_user -pStrongLocalPassword -h 127.0.0.1 meat_lovers_cims -se "SELECT COUNT(*) FROM stock_items;" 2>/dev/null)
echo -e "${GREEN}$stock_count stock items${NC}"

echo -n "Checking suppliers ... "
supplier_count=$(mysql -u meat_lovers_user -pStrongLocalPassword -h 127.0.0.1 meat_lovers_cims -se "SELECT COUNT(*) FROM suppliers;" 2>/dev/null)
echo -e "${GREEN}$supplier_count suppliers${NC}"
echo ""

echo "============================================"
echo "TEST SUMMARY"
echo "============================================"
echo ""
echo "✓ = Endpoint working as expected"
echo "⚠ = Security concern (should be protected)"
echo "✗ = Issue found (needs attention)"
echo ""
echo "NOTE: All protected endpoints returning 401/403"
echo "      is CORRECT behavior (authentication working)"
echo ""
