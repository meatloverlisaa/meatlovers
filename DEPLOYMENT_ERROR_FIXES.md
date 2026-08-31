# Deployment Error Fixes

This document outlines the fixes applied to resolve common deployment errors (401, 400, 502, 503, 504).

## Issues Fixed

### 1. Environment Variable Configuration
**Problem:** Frontend was using hardcoded `http://localhost:3001` fallback, causing connection failures in production.

**Solution:**
- Updated `ui/src/lib/api-config.ts` to check for `BACKEND_API_URL` environment variable
- Added production error handling that throws descriptive error when API URL is not configured
- Updated all API proxy routes to use the centralized configuration

**Required Environment Variables:**
```bash
# Frontend (Next.js)
BACKEND_API_URL=https://your-backend-url.com
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# Backend (NestJS)
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
ALLOWED_ORIGINS=https://your-frontend-url.com,https://your-frontend-url.vercel.app
```

### 2. API Proxy Error Handling
**Problem:** Generic error messages made it difficult to diagnose issues.

**Solution:**
- Enhanced `ui/src/app/api/auth/[...path]/route.ts` with specific error handling:
  - **401 Unauthorized**: Clear authentication failure messages
  - **400 Bad Request**: Detailed validation error messages
  - **502 Bad Gateway**: Service unavailable with retry suggestion
  - **504 Gateway Timeout**: Timeout-specific error messages
  - **503 Service Unavailable**: Configuration error messages
- Added 30-second timeout to prevent hanging requests
- Added error codes for programmatic handling

### 3. CORS Configuration
**Problem:** Strict CORS blocking legitimate requests from deployed domains.

**Solution:**
- Updated `api/src/main.ts` CORS configuration:
  - Added support for Render domains (`*.onrender.com`)
  - Made production CORS more permissive for server-to-server requests
  - Added 24-hour CORS preflight cache
  - Improved origin validation logic

### 4. Health Check Endpoint
**Status:** Already exists at `/health` endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-08-27T12:00:00.000Z",
  "service": "Meat Lovers CIMS API",
  "uptime": 123.45,
  "memory": {
    "used": "45MB",
    "total": "128MB"
  }
}
```

## Deployment Configuration

### Vercel Configuration
Updated `vercel.json` files to include required environment variables:

```json
{
  "env": {
    "BACKEND_API_URL": "@backend-api-url",
    "NEXT_PUBLIC_API_URL": "@backend-api-url"
  }
}
```

### Environment Variable Setup

**For Vercel Deployment:**
1. Go to Project Settings → Environment Variables
2. Add `BACKEND_API_URL` with your backend API URL
3. Add `NEXT_PUBLIC_API_URL` with your backend API URL
4. Redeploy the application

**For Backend Deployment:**
1. Set `DATABASE_URL` to your PostgreSQL connection string
2. Set `JWT_SECRET` to a secure random string
3. Set `ALLOWED_ORIGINS` to your frontend domain(s)
4. Set `NODE_ENV` to `production`

## Error Code Reference

| Status Code | Error Code | Description | Solution |
|------------|------------|-------------|----------|
| 400 | BAD_REQUEST | Invalid request data | Check request payload validation |
| 401 | AUTH_FAILED | Invalid credentials or expired token | Re-authenticate with correct credentials |
| 402 | N/A | Payment Required | Not used in current implementation |
| 502 | SERVICE_UNAVAILABLE | Backend service unavailable | Check backend health and retry |
| 503 | BACKEND_NOT_CONFIGURED | API URL not configured | Set BACKEND_API_URL environment variable |
| 504 | TIMEOUT | Request timeout | Retry request or check network connectivity |

## Testing Checklist

- [ ] Verify `BACKEND_API_URL` is set in deployment environment
- [ ] Test health check endpoint: `GET /health`
- [ ] Test login with correct credentials
- [ ] Test login with incorrect credentials (should return 401)
- [ ] Test with invalid request data (should return 400)
- [ ] Verify CORS headers are present
- [ ] Test API proxy routes
- [ ] Monitor error logs for specific error codes

## Monitoring and Debugging

### Check Backend Health
```bash
curl https://your-backend-url.com/health
```

### Check Frontend Configuration
```bash
# In browser console
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Common Issues and Solutions

**Issue: "Backend API URL is not configured"**
- Solution: Set `BACKEND_API_URL` environment variable in deployment platform

**Issue: CORS errors in browser console**
- Solution: Add your frontend domain to `ALLOWED_ORIGINS` in backend environment

**Issue: 502 Bad Gateway**
- Solution: Check backend is running and accessible from frontend domain

**Issue: 401 Unauthorized**
- Solution: Verify credentials are correct and token is not expired

## Rollback Plan

If issues persist after deployment:

1. Revert CORS changes to previous strict configuration
2. Remove environment variable requirements
3. Restore previous error handling
4. Check backend logs for specific errors
5. Verify database connectivity

## Next Steps

1. Deploy backend first and verify health endpoint
2. Set environment variables in frontend deployment
3. Deploy frontend
4. Run through testing checklist
5. Monitor error logs for 24 hours
