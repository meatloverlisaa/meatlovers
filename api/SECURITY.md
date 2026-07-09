# Authentication & Security Documentation

## Overview

This document describes the comprehensive security features implemented in the Meat Lovers CIMS authentication system.

## 🔐 Security Features Implemented

### 1. **Enhanced Password Requirements**
- Minimum 8 characters (increased from 6)
- Must contain:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (@$!%*?&)
- Maximum 128 characters to prevent DoS attacks
- Passwords hashed with bcrypt (12 rounds)

### 2. **Account Lockout Protection**
- **Max Failed Attempts:** 5 consecutive failed login attempts
- **Lockout Duration:** 30 minutes
- **Automatic Unlock:** Account automatically unlocks after lockout period
- **Reset on Success:** Failed attempt counter resets after successful login
- **Audit Trail:** All lockout events are logged

### 3. **Comprehensive Audit Logging**
All security-related events are logged with:
- User ID (if applicable)
- Action type
- IP address
- User agent
- Timestamp
- Success/failure status
- Error messages (for failed attempts)

**Logged Events:**
- Login success/failure
- Logout
- Password reset requests
- Password reset completion
- Password changes
- Account locked/unlocked
- Token refresh
- Unauthorized access attempts
- Role changes
- User CRUD operations
- Sensitive data access
- Security setting changes

### 4. **Refresh Token Security**
- **Token Storage:** Refresh tokens stored in database (not just JWT)
- **Token Hashing:** Tokens hashed using SHA-256 before storage
- **Token Rotation:** Old refresh token revoked when new one issued
- **Expiry Tracking:** Database tracks token expiry (7 days default)
- **Revocation:** Tokens can be revoked (logout, password change)
- **Metadata:** Stores IP address and user agent for tracking
- **Single Use:** Tokens cannot be reused after refresh

### 5. **Password Reset Security**
- **Secure Tokens:** Cryptographically secure random tokens (32 bytes)
- **Token Hashing:** Tokens hashed using SHA-256 in database
- **Short Expiry:** Tokens expire after 1 hour
- **Single Use:** Tokens marked as used after password reset
- **Email Enumeration Prevention:** Same message for existing/non-existing users
- **Session Invalidation:** All refresh tokens revoked after password reset
- **Audit Trail:** All reset requests and completions logged

### 6. **Rate Limiting**
Implemented at multiple levels:

**Global Rate Limits:**
- **Short:** 10 requests per minute per IP
- **Medium:** 50 requests per 10 minutes per IP
- **Long:** 200 requests per hour per IP

**Auth Endpoint Specific:**
- **Login:** 5 attempts per 15 minutes
- **Password Reset:** 3 requests per 30 minutes

### 7. **Input Validation & Sanitization**
- **DTO Validation:** All inputs validated using class-validator
- **Whitelist Mode:** Only properties with decorators accepted
- **Forbidden Non-Whitelisted:** Throws error on unexpected properties
- **Transformation:** Automatic type conversion and sanitization
- **SQL Injection Protection:** Prisma ORM parameterizes all queries
- **XSS Prevention:** Input sanitization on email/phone fields

### 8. **JWT Security**
- **Secret Management:** JWT_SECRET required in production (no fallback)
- **Token Expiry:** Access tokens expire after 8 hours
- **Stateless with Database Backup:** JWTs for speed, database for revocation
- **Role-Based Claims:** User role embedded in token payload
- **Secure Transmission:** Tokens sent via Authorization header only

### 9. **HTTP Security Headers** (via Helmet)
- **X-Frame-Options:** Prevents clickjacking
- **X-Content-Type-Options:** Prevents MIME-type sniffing
- **Strict-Transport-Security:** Enforces HTTPS
- **X-XSS-Protection:** Enables browser XSS filters
- **Content-Security-Policy:** Restricts resource loading

### 10. **CORS Configuration**
- **Development:** Allows localhost origins
- **Production:** Configurable allowed origins via environment variable
- **Credentials:** Supports cookies and authorization headers
- **Methods:** Restricts to necessary HTTP methods
- **Headers:** Limits allowed headers

### 11. **IP Address Tracking**
- Tracks IP address for all authentication events
- Stores last login IP on user record
- Useful for detecting suspicious activity
- Supports reverse proxy scenarios (trust proxy enabled)

### 12. **User Agent Tracking**
- Records browser/client information
- Helps identify compromised sessions
- Enables device-based security policies

## 📊 Database Schema Changes

### New Tables

#### `audit_logs`
```sql
CREATE TABLE `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NULL,
    `action` ENUM(...) NOT NULL,
    `resource` VARCHAR(255) NULL,
    `resource_id` VARCHAR(255) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `metadata` TEXT NULL,
    `success` BOOLEAN DEFAULT true,
    `error_message` TEXT NULL,
    `created_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    INDEX (user_id, action, created_at)
);
```

#### `refresh_tokens`
```sql
CREATE TABLE `refresh_tokens` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `token_hash` VARCHAR(255) UNIQUE NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `is_revoked` BOOLEAN DEFAULT false,
    `revoked_at` DATETIME(3) NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `created_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    INDEX (user_id, token_hash, expires_at, is_revoked)
);
```

#### `password_reset_tokens`
```sql
CREATE TABLE `password_reset_tokens` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `token_hash` VARCHAR(255) UNIQUE NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `is_used` BOOLEAN DEFAULT false,
    `used_at` DATETIME(3) NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    INDEX (email, token_hash, expires_at)
);
```

### Updated `users` Table
```sql
ALTER TABLE `users` ADD COLUMN `failed_login_attempts` INT DEFAULT 0;
ALTER TABLE `users` ADD COLUMN `account_locked_until` DATETIME(3) NULL;
ALTER TABLE `users` ADD COLUMN `last_login_at` DATETIME(3) NULL;
ALTER TABLE `users` ADD COLUMN `last_login_ip` VARCHAR(45) NULL;
ALTER TABLE `users` ADD COLUMN `password_changed_at` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3);
```

## 🔧 Configuration

### Environment Variables

```env
# REQUIRED in production
JWT_SECRET="your-super-secret-key-change-this"

# Environment
NODE_ENV="production"

# CORS (production)
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Security Settings (optional, defaults shown)
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=30
PASSWORD_RESET_EXPIRY_HOURS=1
REFRESH_TOKEN_EXPIRY_DAYS=7

# Email (for password reset in production)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@meatlovers.com"
```

### Production Deployment Checklist

- [ ] Generate strong JWT_SECRET (minimum 32 characters)
- [ ] Set NODE_ENV to "production"
- [ ] Configure ALLOWED_ORIGINS for CORS
- [ ] Set up SMTP for password reset emails
- [ ] Enable HTTPS/TLS
- [ ] Configure reverse proxy (nginx/apache)
- [ ] Set up log monitoring and alerts
- [ ] Schedule token cleanup job
- [ ] Review and adjust rate limits
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Enable database SSL connection

## 📝 API Endpoints

### Authentication Endpoints

#### POST `/auth/login`
**Rate Limit:** 5 attempts per 15 minutes

**Request:**
```json
{
  "email_or_phone": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response (Success):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "a1b2c3d4e5f6...",
  "user": {
    "id": "1",
    "full_name": "John Doe",
    "email": "user@example.com",
    "phone": null,
    "role": "WAITER",
    "is_active": true
  }
}
```

**Response (Account Locked):**
```json
{
  "statusCode": 401,
  "message": "Account is locked due to multiple failed login attempts. Try again in 28 minutes."
}
```

#### POST `/auth/refresh`
**Request:**
```json
{
  "refresh_token": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "x9y8z7w6v5u4..."
}
```

#### GET `/auth/profile`
**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "id": "1",
  "full_name": "John Doe",
  "email": "user@example.com",
  "phone": null,
  "role": "WAITER",
  "is_active": true,
  "last_login_at": "2026-07-09T10:30:00.000Z",
  "created_at": "2026-01-01T00:00:00.000Z",
  "updated_at": "2026-07-09T10:30:00.000Z"
}
```

#### POST `/auth/forgot-password`
**Rate Limit:** 3 requests per 30 minutes

**Request:**
```json
{
  "email_or_phone": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with that email/phone exists, a password reset link has been sent.",
  "token": "dev-only-token-here" // Only in development
}
```

#### POST `/auth/reset-password`
**Request:**
```json
{
  "token": "reset-token-from-email",
  "new_password": "NewSecure@Pass123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

#### POST `/auth/logout`
**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "message": "Logged out successfully. All sessions have been terminated."
}
```

## 🛡️ Security Best Practices

### For Developers

1. **Never log sensitive data** (passwords, tokens, PII)
2. **Always use parameterized queries** (Prisma does this automatically)
3. **Validate all inputs** on both client and server
4. **Use HTTPS** in production
5. **Keep dependencies updated** (`npm audit fix`)
6. **Review audit logs** regularly for suspicious activity
7. **Implement proper error handling** without exposing system details
8. **Use environment variables** for all secrets
9. **Enable database connection pooling** for performance
10. **Set up monitoring** and alerts for security events

### For System Administrators

1. **Rotate JWT secrets** periodically
2. **Monitor failed login attempts** and implement IP blocking if needed
3. **Review audit logs** for unusual patterns
4. **Keep system patched** and updated
5. **Configure database firewall** rules
6. **Enable database SSL** connections
7. **Set up automated backups** with encryption
8. **Implement DDoS protection** at network level
9. **Use Web Application Firewall** (WAF)
10. **Conduct regular security audits**

## 🔍 Monitoring & Maintenance

### Regular Tasks

**Daily:**
- Review audit logs for failed login attempts
- Check for locked accounts
- Monitor rate limit violations

**Weekly:**
- Review suspicious activity patterns
- Check token usage statistics
- Verify backup integrity

**Monthly:**
- Run security audit
- Review and update security policies
- Clean up expired tokens (or automate)
- Review user access patterns

### Token Cleanup

Run periodically to remove expired tokens:

```typescript
// In a scheduled job
await authService.cleanupExpiredTokens();
```

### Audit Log Queries

```typescript
// Get recent failed logins
const failedLogins = await auditLogService.getRecentFailedLogins('user@example.com', 15);

// Get user's audit history
const userAudit = await auditLogService.getUserAuditLogs(userId, 50);
```

## 🚨 Incident Response

### Account Compromise

1. **Revoke all sessions:**
   ```sql
   UPDATE refresh_tokens 
   SET is_revoked = true, revoked_at = NOW() 
   WHERE user_id = <compromised_user_id>;
   ```

2. **Force password reset:**
   ```sql
   UPDATE users 
   SET account_locked_until = DATE_ADD(NOW(), INTERVAL 24 HOUR)
   WHERE id = <compromised_user_id>;
   ```

3. **Review audit logs:**
   ```sql
   SELECT * FROM audit_logs 
   WHERE user_id = <compromised_user_id>
   ORDER BY created_at DESC 
   LIMIT 100;
   ```

### Brute Force Attack

1. **Identify attacking IPs:**
   ```sql
   SELECT ip_address, COUNT(*) as attempts 
   FROM audit_logs 
   WHERE action = 'LOGIN_FAILED' 
   AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
   GROUP BY ip_address 
   HAVING attempts > 20;
   ```

2. **Block IPs** at firewall level

3. **Adjust rate limits** if needed

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

## 🔄 Version History

- **v1.0.0** (2026-07-09): Initial security implementation
  - Enhanced password requirements
  - Account lockout protection
  - Comprehensive audit logging
  - Refresh token rotation
  - Password reset security
  - Rate limiting
  - Input validation
  - Security headers
