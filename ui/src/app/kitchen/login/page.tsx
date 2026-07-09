import LoginForm from '@/components/auth/LoginForm';

export default function KitchenLoginPage() {
  return (
    <LoginForm
      roleTitle="Kitchen"
      roleDescription="Food preparation and kitchen queue management"
      allowedRoles={['CHEF']}
    />
  );
}
