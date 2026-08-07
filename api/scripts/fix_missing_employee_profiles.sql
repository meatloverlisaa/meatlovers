-- File: fix_missing_employee_profiles.sql
-- Description: Creates basic employee profiles for staff users without profiles
-- Date: August 7, 2026
-- Impact: Creates employee_profiles for 10 users

BEGIN;

-- Create employee profiles for users without them
INSERT INTO employee_profiles (
  user_id,
  employment_start_date,
  employment_type,
  employment_status,
  created_at,
  updated_at
)
SELECT 
  u.id as user_id,
  u.created_at::date as employment_start_date,
  'PERMANENT' as employment_type,
  'ACTIVE' as employment_status,
  NOW() as created_at,
  NOW() as updated_at
FROM users u
LEFT JOIN employee_profiles ep ON u.id = ep.user_id
WHERE u.role NOT IN ('SUPER_ADMIN', 'ADMIN')
  AND ep.id IS NULL;

-- Verify the fix
SELECT 
  COUNT(*) as users_without_profiles,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ ALL USERS HAVE PROFILES'
    ELSE '❌ STILL HAVE USERS WITHOUT PROFILES'
  END as status
FROM users u
LEFT JOIN employee_profiles ep ON u.id = ep.user_id
WHERE u.role NOT IN ('SUPER_ADMIN', 'ADMIN')
  AND ep.id IS NULL;

COMMIT;

-- Final summary
SELECT 
  'Employee Profiles Created Successfully' as message,
  COUNT(*) as total_profiles
FROM employee_profiles;
