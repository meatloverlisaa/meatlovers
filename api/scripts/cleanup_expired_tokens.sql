-- File: cleanup_expired_tokens.sql
-- Description: Revokes all expired refresh tokens for security and cleanup
-- Date: August 7, 2026
-- Impact: Revokes approximately 8 expired tokens

BEGIN;

-- Show tokens that will be affected
SELECT 
  'Tokens to be revoked:' as message,
  COUNT(*) as count
FROM refresh_tokens
WHERE expires_at < NOW()
  AND is_revoked = false;

-- Update expired tokens to revoked
UPDATE refresh_tokens
SET 
  is_revoked = true,
  revoked_at = NOW()
WHERE expires_at < NOW()
  AND is_revoked = false;

-- Show summary after update
SELECT 
  COUNT(*) as total_tokens,
  SUM(CASE WHEN is_revoked THEN 1 ELSE 0 END) as revoked_tokens,
  SUM(CASE WHEN expires_at < NOW() AND NOT is_revoked THEN 1 ELSE 0 END) as expired_not_revoked,
  CASE 
    WHEN SUM(CASE WHEN expires_at < NOW() AND NOT is_revoked THEN 1 ELSE 0 END) = 0 
    THEN '✅ ALL EXPIRED TOKENS REVOKED'
    ELSE '❌ STILL HAVE EXPIRED TOKENS NOT REVOKED'
  END as status
FROM refresh_tokens;

COMMIT;

-- Optional: Delete very old tokens (uncomment if needed)
-- DELETE FROM refresh_tokens
-- WHERE expires_at < NOW() - INTERVAL '30 days';
