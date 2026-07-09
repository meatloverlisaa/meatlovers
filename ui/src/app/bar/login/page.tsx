import LoginForm from '@/components/auth/LoginForm';

export default function BarLoginPage() {
  return (
    <LoginForm
      roleTitle="Bar"
      roleDescription="Beverage preparation and bar queue management"
      allowedRoles={['BARMAN']}
    />
  );
}
