# Kitchen Queue 500 Error - Diagnostic & Fix

**Error**: `Failed to load kitchen queue: 500`  
**Location**: `/kitchen/queue` page  
**Date**: August 6, 2026

---

## 🔍 DIAGNOSIS

### What's Happening:
- The frontend (`/kitchen/queue` page) calls: `http://localhost:3001/kitchen/queue`
- The API returns HTTP 500 (Internal Server Error)
- The endpoint exists and the code looks correct

### Possible Causes:

1. **Database Connection Issue**
   - API can't connect to PostgreSQL
   - Connection string incorrect

2. **Missing Table/Data**
   - `Order` table is empty
   - No orders in database to query

3. **API Server Not Running**
   - Backend might have crashed
   - Need to restart

4. **Authentication Token Issue**
   - Token expired or invalid
   - Need to re-login

---

## 🔧 FIX STEPS

### Step 1: Check if API is Running

```bash
cd /home/the-macharias/MeatLovers/meetlovers/api
npm run start:dev
```

**Look for**:
- ✅ "Nest application successfully started"
- ✅ "Listening on port 3001"
- ❌ Any error messages

### Step 2: Check Database Connection

```bash
cd /home/the-macharias/MeatLovers/meetlovers/api
npx prisma studio
```

This opens Prisma Studio. Check:
- Can you see the `Order` table?
- Are there any orders in the database?
- Are the relations (items, waiter, table) working?

### Step 3: Test API Directly

```bash
# Get a fresh auth token first
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email_or_phone": "chef@meatlovers.com",
    "password": "Chef@1234"
  }'

# Copy the access_token from response, then:
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3001/kitchen/queue
```

**Expected Response**:
- HTTP 200 with array of orders (can be empty `[]`)
- NOT HTTP 500

### Step 4: Check API Logs

Look at the terminal where API is running. The 500 error should show a stack trace like:

```
[Nest] ERROR [ExceptionsHandler] ...
```

This will tell you the exact error.

### Step 5: Seed Test Data

If the Order table is empty, create test orders:

```bash
cd /home/the-macharias/MeatLovers/meetlovers/api

# Create a seed file for orders
```

---

## 🚀 QUICK FIX (Most Likely)

The most common cause is **authentication token expired**. Fix:

1. **Logout** from the kitchen dashboard
2. Go to `http://localhost:3000/login`
3. **Login again** as Chef:
   - Email: `chef@meatlovers.com`
   - Password: `Chef@1234`
4. Try accessing `/kitchen/queue` again

---

## 📝 VERIFICATION

After fixing, verify:

```bash
# 1. API is running
curl http://localhost:3001/health

# 2. Kitchen queue endpoint works
# (Use token from login above)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/kitchen/queue

# 3. Frontend loads
# Visit: http://localhost:3000/kitchen/queue
```

---

## 🔍 DEBUG MODE

If still getting 500, add error logging to the kitchen service:

**File**: `/api/src/kitchen/kitchen.service.ts`

```typescript
async getKitchenQueue(status?: string) {
  try {
    const where: any = {
      status: status || { in: ['PENDING', 'PREPARING', 'READY'] },
    };

    console.log('[Kitchen Queue] Query where:', where);

    const orders = await (this.prisma as any).order.findMany({
      where,
      orderBy: { created_at: 'asc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                product_category: true,
              },
            },
            order: false,
          },
        },
        waiter: {
          select: {
            id: true,
            full_name: true,
          },
        },
        table: true,
      },
    });

    console.log('[Kitchen Queue] Found orders:', orders.length);

    const foodOrders = orders.filter((order) => {
      return order.items.some((item: any) => {
        return item.product?.product_category === 'FOOD';
      });
    });

    console.log('[Kitchen Queue] Filtered food orders:', foodOrders.length);

    return foodOrders;
  } catch (error) {
    console.error('[Kitchen Queue] ERROR:', error);
    throw error;
  }
}
```

Then restart API and check logs.

---

## 💡 COMMON ISSUES & SOLUTIONS

### Issue 1: "relation does not exist"
**Solution**: Run Prisma migrations
```bash
cd /home/the-macharias/MeatLovers/meetlovers/api
npx prisma migrate deploy
npx prisma generate
```

### Issue 2: Empty response `[]`
**Solution**: This is normal! It means no orders in queue. Create test orders from POS.

### Issue 3: "Cannot read property 'product_category'"
**Solution**: Missing product data. Seed products first.

### Issue 4: "Invalid token"
**Solution**: Re-login to get fresh token.

---

## ✅ EXPECTED BEHAVIOR

### When Working Correctly:

1. **Empty Queue** (No orders):
   ```json
   []
   ```

2. **Orders in Queue**:
   ```json
   [
     {
       "id": "1",
       "table_id": "5",
       "status": "PENDING",
       "items": [
         {
           "id": "1",
           "product": {
             "id": "10",
             "product_category": "FOOD"
           },
           "quantity": 2
         }
       ],
       "waiter": {
         "id": "user_123",
         "full_name": "Waiter One"
       },
       "table": {
         "id": "5",
         "table_number": "5"
       }
     }
   ]
   ```

---

## 📞 NEXT STEPS

1. **First**: Check API logs for actual error message
2. **Second**: Re-login to get fresh auth token
3. **Third**: Restart API server if needed
4. **Fourth**: Check database has Order table with data

**Most likely fix**: Re-login to refresh authentication token.

---

**Status**: DIAGNOSTIC COMPLETE  
**Action Required**: Follow steps above to identify specific error
