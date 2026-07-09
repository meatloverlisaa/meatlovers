# 🔐 Authentication Security Flow Diagram

## Login Flow with Security Features

```
┌─────────────┐
│   Client    │
│ (Browser/   │
│    App)     │
└──────┬──────┘
       │
       │ 1. POST /auth/login
       │    { email_or_phone, password }
       ▼
┌──────────────────────────────────────────────┐
│         Rate Limiting Middleware             │
│  • Check: 5 attempts per 15 min?            │
│  • If exceeded → 429 Too Many Requests       │
└──────┬───────────────────────────────────────┘
       │ ✓ Passed
       ▼
┌──────────────────────────────────────────────┐
│         Input Validation (DTO)               │
│  • Validate email/phone format               │
│  • Validate password length                  │
│  • Sanitize inputs                           │
└──────┬───────────────────────────────────────┘
       │ ✓ Valid
       ▼
┌──────────────────────────────────────────────┐
│         Find User in Database                │
│  • Search by email OR phone                  │
│  • Sanitize input (trim, lowercase)          │
└──────┬───────────────────────────────────────┘
       │
       ├─ User Not Found
       │  └──> Audit Log (LOGIN_FAILED)
       │  └──> 401 "Invalid credentials"
       │
       │ ✓ User Found
       ▼
┌──────────────────────────────────────────────┐
│         Check Account Status                 │
│  • Is account locked? (account_locked_until) │
│  • Is user active? (is_active)               │
└──────┬───────────────────────────────────────┘
       │
       ├─ Account Locked
       │  └──> Audit Log (LOGIN_FAILED)
       │  └──> 401 "Account locked for X minutes"
       │
       ├─ Account Inactive
       │  └──> Audit Log (LOGIN_FAILED)
       │  └──> 401 "Account inactive"
       │
       │ ✓ Account OK
       ▼
┌──────────────────────────────────────────────┐
│         Verify Password                      │
│  • bcrypt.compare(password, hash)            │
│  • 12 rounds of bcrypt                       │
└──────┬───────────────────────────────────────┘
       │
       ├─ Password Invalid
       │  │
       │  ├──> Increment failed_login_attempts
       │  ├──> If attempts >= 5:
       │  │     • Set account_locked_until (30 min)
       │  │     • Audit Log (ACCOUNT_LOCKED)
       │  │
       │  └──> Audit Log (LOGIN_FAILED)
       │  └──> 401 "Invalid credentials"
       │        (or "Account locked" if applicable)
       │
       │ ✓ Password Valid
       ▼
┌──────────────────────────────────────────────┐
│         Update User Record                   │
│  • failed_login_attempts = 0                 │
│  • account_locked_until = null               │
│  • last_login_at = NOW()                     │
│  • last_login_ip = client IP                 │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Generate Tokens                      │
│                                              │
│  ACCESS TOKEN:                               │
│  • Payload: { sub, email, role }             │
│  • Expiry: 8 hours                           │
│  • Algorithm: HS256                          │
│  • Secret: JWT_SECRET                        │
│                                              │
│  REFRESH TOKEN:                              │
│  • Generate 32-byte random token             │
│  • Hash with SHA-256                         │
│  • Store in refresh_tokens table             │
│  • Expiry: 7 days                            │
│  • Track: IP, User Agent                     │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Audit Log                            │
│  • Action: LOGIN_SUCCESS                     │
│  • user_id, ip_address, user_agent           │
│  • timestamp                                 │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Response to Client                   │
│  {                                           │
│    access_token: "eyJhbG...",               │
│    refresh_token: "a1b2c3...",              │
│    user: { id, name, email, role }          │
│  }                                           │
└──────────────────────────────────────────────┘
```

---

## Password Reset Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. POST /auth/forgot-password
       │    { email_or_phone }
       ▼
┌──────────────────────────────────────────────┐
│         Rate Limiting                        │
│  • Check: 3 requests per 30 min?            │
└──────┬───────────────────────────────────────┘
       │ ✓
       ▼
┌──────────────────────────────────────────────┐
│         Find User                            │
│  • Search by email OR phone                  │
└──────┬───────────────────────────────────────┘
       │
       ├─ User Not Found
       │  └──> Audit Log (PASSWORD_RESET_REQUESTED)
       │  └──> 200 "Reset link sent" (same response)
       │
       │ ✓ User Found
       ▼
┌──────────────────────────────────────────────┐
│         Generate Secure Token                │
│  • crypto.randomBytes(32) → hex              │
│  • Hash with SHA-256                         │
│  • Store in password_reset_tokens table      │
│  • Expiry: 1 hour                            │
│  • Track: IP address                         │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Send Email (Production)              │
│  • To: user email                            │
│  • Link: /reset-password?token=...           │
│  • Or log to console (Development)           │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Audit Log                            │
│  • Action: PASSWORD_RESET_REQUESTED          │
└──────┬───────────────────────────────────────┘
       │
       ▼
   200 "Reset link sent"

═══════════════════════════════════════════════

       │ 2. User clicks link
       │    or enters token
       │
       ▼
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 3. POST /auth/reset-password
       │    { token, new_password }
       ▼
┌──────────────────────────────────────────────┐
│         Validate Password                    │
│  • Min 8 characters                          │
│  • Must have: uppercase, lowercase,          │
│    number, special char                      │
└──────┬───────────────────────────────────────┘
       │ ✓
       ▼
┌──────────────────────────────────────────────┐
│         Find Reset Token                     │
│  • Hash provided token with SHA-256          │
│  • Search password_reset_tokens              │
└──────┬───────────────────────────────────────┘
       │
       ├─ Token Not Found
       │  └──> 400 "Invalid reset token"
       │
       ├─ Token Already Used (is_used = true)
       │  └──> 400 "Token already used"
       │
       ├─ Token Expired (expires_at < NOW)
       │  └──> 400 "Token expired"
       │
       │ ✓ Token Valid
       ▼
┌──────────────────────────────────────────────┐
│         Find User by Email                   │
└──────┬───────────────────────────────────────┘
       │ ✓
       ▼
┌──────────────────────────────────────────────┐
│         Transaction: Update Database         │
│  1. Hash new password (bcrypt, 12 rounds)    │
│  2. Update users:                            │
│     • password_hash = new hash               │
│     • password_changed_at = NOW()            │
│     • failed_login_attempts = 0              │
│     • account_locked_until = null            │
│  3. Mark token as used:                      │
│     • is_used = true                         │
│     • used_at = NOW()                        │
│  4. Revoke all refresh tokens                │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Audit Log                            │
│  • Action: PASSWORD_RESET_COMPLETED          │
│  • user_id, ip_address                       │
└──────┬───────────────────────────────────────┘
       │
       ▼
   200 "Password reset successfully"
```

---

## Token Refresh Flow

```
┌─────────────┐
│   Client    │
│ (has expired│
│ access token│
│ but valid   │
│ refresh)    │
└──────┬──────┘
       │
       │ POST /auth/refresh
       │ { refresh_token }
       ▼
┌──────────────────────────────────────────────┐
│         Rate Limiting                        │
│  • Check: 10 requests per minute?            │
└──────┬───────────────────────────────────────┘
       │ ✓
       ▼
┌──────────────────────────────────────────────┐
│         Hash Provided Token                  │
│  • SHA-256 hash of refresh_token             │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Find Token in Database               │
│  • Search refresh_tokens by token_hash       │
│  • Include user data                         │
└──────┬───────────────────────────────────────┘
       │
       ├─ Token Not Found
       │  └──> 401 "Invalid refresh token"
       │
       ├─ Token Revoked (is_revoked = true)
       │  └──> 401 "Token revoked"
       │
       ├─ Token Expired (expires_at < NOW)
       │  └──> 401 "Token expired"
       │
       │ ✓ Token Valid
       ▼
┌──────────────────────────────────────────────┐
│         Check User Status                    │
│  • Is user active?                           │
└──────┬───────────────────────────────────────┘
       │
       ├─ User Inactive
       │  └──> 401 "User inactive"
       │
       │ ✓ User Active
       ▼
┌──────────────────────────────────────────────┐
│         Revoke Old Token (Rotation)          │
│  • Update refresh_tokens:                    │
│    - is_revoked = true                       │
│    - revoked_at = NOW()                      │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Generate New Tokens                  │
│  • New access token (8 hours)                │
│  • New refresh token (7 days)                │
│  • Store new refresh token in DB             │
│  • Track IP and User Agent                   │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Audit Log                            │
│  • Action: TOKEN_REFRESHED                   │
│  • user_id, ip_address                       │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Response                             │
│  {                                           │
│    access_token: "new_token...",            │
│    refresh_token: "new_refresh..."          │
│  }                                           │
└──────────────────────────────────────────────┘
```

---

## Protected Endpoint Access

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ GET /api/protected-resource
       │ Authorization: Bearer <access_token>
       ▼
┌──────────────────────────────────────────────┐
│         Rate Limiting Middleware             │
│  • General API: 10 req/min                   │
└──────┬───────────────────────────────────────┘
       │ ✓
       ▼
┌──────────────────────────────────────────────┐
│         JWT Auth Guard                       │
│  • Extract token from Authorization header   │
│  • Verify token signature                    │
│  • Check expiry                              │
└──────┬───────────────────────────────────────┘
       │
       ├─ Token Missing
       │  └──> 401 "Missing Authorization header"
       │
       ├─ Token Invalid/Expired
       │  └──> 401 "Invalid or expired token"
       │
       │ ✓ Token Valid
       ▼
┌──────────────────────────────────────────────┐
│         Extract User from Token              │
│  • Decode JWT payload                        │
│  • Extract: { sub, email, role }             │
│  • Attach to request.user                    │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Check Roles (if @Roles present)      │
│  • Does user.role match required roles?      │
└──────┬───────────────────────────────────────┘
       │
       ├─ Role Not Allowed
       │  └──> Audit Log (UNAUTHORIZED_ACCESS)
       │  └──> 403 "Access denied"
       │
       │ ✓ Role Allowed
       ▼
┌──────────────────────────────────────────────┐
│         Execute Controller Method            │
│  • Access request.user for user info         │
│  • Process business logic                    │
└──────┬───────────────────────────────────────┘
       │
       ▼
   200 + Response Data
```

---

## Logout Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ POST /auth/logout
       │ Authorization: Bearer <access_token>
       ▼
┌──────────────────────────────────────────────┐
│         JWT Auth Guard                       │
│  • Verify access token                       │
│  • Extract user ID                           │
└──────┬───────────────────────────────────────┘
       │ ✓
       ▼
┌──────────────────────────────────────────────┐
│         Revoke All User's Refresh Tokens     │
│  • UPDATE refresh_tokens                     │
│    SET is_revoked = true,                    │
│        revoked_at = NOW()                    │
│    WHERE user_id = ? AND is_revoked = false  │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Audit Log                            │
│  • Action: LOGOUT                            │
│  • user_id, ip_address, user_agent           │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Response                             │
│  {                                           │
│    message: "Logged out successfully.        │
│             All sessions terminated."        │
│  }                                           │
└──────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│   Client    │
│  • Remove   │
│    tokens   │
│  • Redirect │
│    to login │
└─────────────┘
```

---

## Security Event Logging

```
Every Security Event
       │
       ▼
┌──────────────────────────────────────────────┐
│         Audit Log Service                    │
│                                              │
│  capture:                                    │
│  • user_id (if applicable)                   │
│  • action (enum)                             │
│  • resource & resource_id                    │
│  • ip_address                                │
│  • user_agent                                │
│  • metadata (JSON)                           │
│  • success (true/false)                      │
│  • error_message (if failed)                 │
│  • timestamp                                 │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│         Database: audit_logs table           │
│  • Indexed by user_id, action, timestamp     │
│  • Never deleted (append-only)               │
│  • Used for:                                 │
│    - Security monitoring                     │
│    - Incident investigation                  │
│    - Compliance reporting                    │
│    - User activity tracking                  │
└──────────────────────────────────────────────┘
```

---

## Key Security Principles Applied

1. **Defense in Depth**
   - Multiple validation layers
   - Rate limiting at multiple levels
   - Token verification + database checks

2. **Fail Secure**
   - Default deny (JWT guard on all routes)
   - Errors don't expose information
   - Same response for user not found / wrong password

3. **Complete Mediation**
   - Every request goes through guards
   - No caching of authorization decisions
   - Re-verify on every API call

4. **Audit Trail**
   - Every security event logged
   - Immutable log records
   - Complete context captured

5. **Least Privilege**
   - Role-based access control
   - Minimal token expiry times
   - Revocation on security events

6. **Token Rotation**
   - Old tokens revoked on refresh
   - Prevents token replay
   - Limits window of compromise
