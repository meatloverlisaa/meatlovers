# 🚀 Security Features - Quick Start Guide

## For Developers

### 1. Password Requirements
**Users must create passwords with:**
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (@$!%*?&)

**Example valid password:** `SecureP@ss123`

### 2. Account Lockout
- **5 failed login attempts** = account locked
- **30 minutes** lockout duration
- Counter resets on successful login

### 3. Rate Limits
| Endpoint | Limit |
|----------|-------|
| Login | 5 attempts per 15 minutes |
| Password Reset | 3 requests per 30 minutes |
| General API | 10 requests per minute |

### 4. Token Management

**Access Token:**
- Expires after 8 hours
- Use for API requests
- Send in `Authorization: Bearer <token>` header

**Refresh Token:**
- Expires after 7 days
- Automatically rotates (old token revoked)
- Use to get new access token

### 5. Using the API

#### Login
```typescript
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email_or_phone: 'user@example.com',
    password: 'SecureP@ss123'
  })
});

const { access_token, refresh_token, user } = await response.json();
```

#### Get Profile
```typescript
const response = await fetch('http://localhost:3001/auth/profile', {
  headers: { 
    'Authorization': `Bearer ${access_token}` 
  }
});

const profile = await response.json();
```

#### Refresh Token
```typescript
const response = await fetch('http://localhost:3001/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refresh_token: refresh_token
  })
});

const { access_token: newToken, refresh_token: newRefresh } = await response.json();
```

#### Logout
```typescript
await fetch('http://localhost:3001/auth/logout', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${access_token}` 
  }
});
```

### 6. Checking Audit Logs

```typescript
import { AuditLogService } from './auth/audit-log.service';

// Get user's recent activity
const logs = await auditLogService.getUserAuditLogs(userId, 50);

// Check recent failed logins
const failedAttempts = await auditLogService.getRecentFailedLogins('user@example.com', 15);
```

### 7. Error Handling

**Common Error Codes:**
- `401 Unauthorized` - Invalid credentials or token
- `403 Forbidden` - Insufficient permissions
- `429 Too Many Requests` - Rate limit exceeded

**Account Locked Response:**
```json
{
  "statusCode": 401,
  "message": "Account is locked due to multiple failed login attempts. Try again in 28 minutes."
}
```

**Invalid Password Response:**
```json
{
  "statusCode": 400,
  "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
}
```

### 8. Production Checklist

Before deploying:

- [ ] Generate strong `JWT_SECRET` (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Set up SMTP for password reset emails
- [ ] Enable HTTPS/TLS
- [ ] Review and test all endpoints
- [ ] Set up log monitoring
- [ ] Configure database backups

### 9. Testing Locally

```bash
# Start the API
npm run start:dev

# Test login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email_or_phone":"admin@test.com","password":"Admin123!"}'

# Test with invalid password (should fail)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email_or_phone":"admin@test.com","password":"weak"}'
```

### 10. Debugging

**Enable detailed logs:**
```typescript
// In development only
console.log('User login attempt:', { email, ip, timestamp });
```

**Check database directly:**
```sql
-- Recent audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;

-- Locked accounts
SELECT id, email, phone, account_locked_until 
FROM users 
WHERE account_locked_until > NOW();

-- Active refresh tokens
SELECT user_id, created_at, expires_at 
FROM refresh_tokens 
WHERE is_revoked = false AND expires_at > NOW();
```

---

## Quick Reference

**Documentation:**
- Full docs: `SECURITY.md`
- Implementation summary: `SECURITY_HARDENING_COMPLETE.md`
- This guide: `SECURITY_QUICKSTART.md`

**Key Files:**
- Auth Service: `src/auth/auth.service.ts`
- Audit Logging: `src/auth/audit-log.service.ts`
- Controller: `src/auth/auth.controller.ts`
- Guards: `src/auth/jwt-auth.guard.ts`

**Need Help?**
1. Check the error message
2. Review audit logs
3. Read SECURITY.md
4. Check server logs
