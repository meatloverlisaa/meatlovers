import LoginForm from '@/components/auth/LoginForm';

export default function CashierLoginPage() {
  return (
    <LoginForm
      roleTitle="Cashier"
      roleDescription="Payment processing and order settlement"
      allowedRoles={['CASHIER']}
    />
  );
}
