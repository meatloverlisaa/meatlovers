"use client";

import { IconRenderer } from "@/components/ui/IconRenderer";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WhoAmIPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Not Logged In</h1>
          <p className="text-gray-300 mb-6">You are not currently authenticated.</p>
          <div className="space-y-3">
            <Link href="/admin/login" className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
              Admin Login
            </Link>
            <Link href="/storekeeper/login" className="block w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700">
              Storekeeper Login
            </Link>
            <Link href="/hr/login" className="block w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
              HR Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getRoleDashboard = (role: string) => {
    const dashboards: Record<string, string> = {
      SUPER_ADMIN: '/super-admin',
      ADMIN: '/admin',
      MANAGER: '/manager',
      CASHIER: '/cashier',
      WAITER: '/pos',
      CHEF: '/kitchen',
      STOREKEEPER: '/storekeeper',
      BARMAN: '/bar',
      DISPATCHER: '/dispatcher',
      ACCOUNTANT: '/accountant',
      HR: '/hr',
    };
    return dashboards[role] || '/';
  };

  const dashboardUrl = getRoleDashboard(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="mb-2 flex items-center justify-center gap-2">
            <IconRenderer icon="user" className="h-8 w-8 text-white" />
            <h1 className="text-4xl font-bold text-white">Current User</h1>
          </div>
          <p className="text-gray-400">Your authentication details</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-gray-400 font-semibold">Name:</span>
              <span className="text-white text-lg font-bold">{user.full_name}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-gray-400 font-semibold">Email:</span>
              <span className="text-white">{user.email || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-gray-400 font-semibold">Phone:</span>
              <span className="text-white">{user.phone || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-gray-400 font-semibold">User ID:</span>
              <span className="text-white">{user.id}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-gray-400 font-semibold">Role:</span>
              <span className={`text-lg font-black px-4 py-2 rounded-full ${
                user.role === 'STOREKEEPER' ? 'bg-purple-600 text-white' :
                user.role === 'HR' ? 'bg-green-600 text-white' :
                user.role === 'ADMIN' ? 'bg-blue-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {user.role}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-semibold">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                user.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link 
            href={dashboardUrl}
            className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-center font-bold transition"
          >
            Go to My Dashboard ({user.role})
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold transition"
          >
            Logout
          </button>

          <Link 
            href="/"
            className="block w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 text-center font-bold transition"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-8 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
          <div className="mb-2 flex items-center gap-2">
            <IconRenderer icon="warning" className="h-4 w-4 text-yellow-200" />
            <p className="text-yellow-200 text-sm font-semibold">Role Access Info:</p>
          </div>
          <p className="text-yellow-100 text-xs">
            {user.role === 'STOREKEEPER' 
              ? "You have STOREKEEPER access. You can visit /storekeeper dashboard."
              : user.role === 'HR'
              ? "You have HR access. If you try to visit /storekeeper, you'll be redirected back to /hr because you don't have STOREKEEPER role."
              : `You have ${user.role} access. Each role can only access their designated dashboard.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
