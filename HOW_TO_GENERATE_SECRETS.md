# How to Generate Secure JWT Secrets

## 🔐 Quick Generation Methods

### Method 1: Using Node.js (Recommended)

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate REFRESH_TOKEN_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Method 2: Using OpenSSL

```bash
# Generate JWT_SECRET
openssl rand -base64 64 | tr -d '\n' && echo

# Generate REFRESH_TOKEN_SECRET
openssl rand -base64 64 | tr -d '\n' && echo
```

### Method 3: Using Python

```bash
# Generate JWT_SECRET
python3 -c "import secrets; print(secrets.token_hex(64))"

# Generate REFRESH_TOKEN_SECRET
python3 -c "import secrets; print(secrets.token_hex(64))"
```

### Method 4: Online (Use with Caution)

Visit: https://generate-secret.vercel.app/64
- Click "Generate Random Secret"
- Copy the generated string
- **Note**: Only use for development, not production

---

## 📋 Complete Environment Variables Template

```env
# JWT Configuration
JWT_SECRET=<paste-your-generated-secret-here>
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=<paste-your-generated-refresh-secret-here>
REFRESH_TOKEN_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3001

# Database (auto-provided by Railway/Render)
DATABASE_URL=postgresql://...
```

---

## 🎯 What Each Variable Does

### JWT_SECRET
- **Purpose**: Signs and verifies access tokens
- **Length**: 128 characters (64 bytes in hex)
- **Security**: Must be kept secret, never exposed
- **Usage**: Short-lived authentication tokens (1 hour)

### JWT_EXPIRES_IN
- **Purpose**: How long access tokens are valid
- **Default**: `1h` (1 hour)
- **Options**: `15m`, `30m`, `1h`, `2h`, `1d`
- **Recommendation**: Keep short for security (1h or less)

### REFRESH_TOKEN_SECRET
- **Purpose**: Signs and verifies refresh tokens
- **Length**: 128 characters (64 bytes in hex)
- **Security**: Must be DIFFERENT from JWT_SECRET
- **Usage**: Long-lived tokens for refreshing access (7 days)

### REFRESH_TOKEN_EXPIRES_IN
- **Purpose**: How long refresh tokens are valid
- **Default**: `7d` (7 days)
- **Options**: `1d`, `7d`, `14d`, `30d`
- **Recommendation**: Balance convenience vs security (7-14 days)

---

## ✅ Security Best Practices

1. **Use Different Secrets for Each Environment**
   ```
   Development  → One set of secrets
   Staging      → Different secrets
   Production   → Completely different secrets
   ```

2. **Never Commit Secrets to Git**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.production
   PRODUCTION_SECRETS.txt
   ```

3. **Use Environment Variables**
   - Store secrets in Railway/Render/Vercel dashboard
   - Never hardcode in source code
   - Access via `process.env.JWT_SECRET`

4. **Rotate Secrets Regularly**
   - Change production secrets every 3-6 months
   - Immediately if compromised
   - Keep old secrets for transition period

5. **Use Strong Secrets**
   - Minimum 32 bytes (64 hex characters)
   - Cryptographically random
   - Not based on dictionary words

---

## 🔄 How to Rotate Secrets (Production)

1. **Generate New Secrets**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Deploy with Both Old and New**
   - Keep old JWT_SECRET temporarily
   - Add new JWT_SECRET_NEW
   - Verify new tokens work

3. **Switch to New Secret**
   - Replace JWT_SECRET with new value
   - Users will need to re-login
   - Monitor for issues

4. **Remove Old Secret**
   - After all users re-authenticated
   - Delete old secret from environment

---

## 🧪 Testing Your Secrets

```bash
# Test secrets are set correctly
cd api
node -e "require('dotenv').config(); console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length)"
# Should output: JWT_SECRET length: 128

node -e "require('dotenv').config(); console.log('REFRESH_TOKEN_SECRET length:', process.env.REFRESH_TOKEN_SECRET?.length)"
# Should output: REFRESH_TOKEN_SECRET length: 128
```

---

## 🚨 What NOT to Do

❌ **Don't use simple passwords**
```env
JWT_SECRET=password123  # INSECURE!
```

❌ **Don't use short secrets**
```env
JWT_SECRET=abc123xyz  # TOO SHORT!
```

❌ **Don't reuse secrets**
```env
JWT_SECRET=same-secret-here
REFRESH_TOKEN_SECRET=same-secret-here  # WRONG!
```

❌ **Don't commit secrets to Git**
```bash
git add .env  # NEVER DO THIS!
```

❌ **Don't share secrets publicly**
```env
# Posted on GitHub, Stack Overflow, Discord, etc.
```

---

## 📝 Quick Reference

**Generate all secrets at once:**
```bash
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
echo "REFRESH_TOKEN_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
```

**Save to file (local development only):**
```bash
cat > .env.local << EOF
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
REFRESH_TOKEN_EXPIRES_IN=7d
EOF
```

---

## 🎓 Understanding JWT

```
Access Token (JWT_SECRET)
├── Short-lived (1 hour)
├── Sent with every API request
├── Contains user info and permissions
└── If compromised, expires quickly

Refresh Token (REFRESH_TOKEN_SECRET)  
├── Long-lived (7 days)
├── Used only to get new access tokens
├── Stored securely (httpOnly cookie)
└── Different secret for extra security
```

---

**Remember**: Your secrets are like keys to your house - keep them safe! 🔐
