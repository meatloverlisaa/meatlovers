import LoginForm from '@/components/auth/LoginForm';

export default function AdminLoginPage() {
  return (
    <LoginForm
      roleTitle="Admin"
      roleDescription="Administrative access to system management and configuration"
      allowedRoles={['SUPER_ADMIN', 'ADMIN']}
    />
  );
}
