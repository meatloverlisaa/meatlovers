import LoginForm from '@/components/auth/LoginForm';

export default function POSLoginPage() {
  return (
    <LoginForm
      roleTitle="Point of Sale"
      roleDescription="Order management and customer service"
      allowedRoles={['WAITER']}
    />
  );
}
