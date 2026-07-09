import LoginForm from '@/components/auth/LoginForm';

export default function StaffLoginPage() {
  return (
    <LoginForm
      roleTitle="Staff"
      roleDescription="Staff access for various operational roles"
      allowedRoles={['MANAGER', 'STOREKEEPER', 'DISPATCHER', 'ACCOUNTANT', 'HR']}
    />
  );
}
