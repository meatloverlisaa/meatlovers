'use client';

import { useEffect, useState } from 'react';

export default function BarDebugPage() {
  const [debug, setDebug] = useState<Record<string, any>>({});

  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    const accessToken = localStorage.getItem('access_token'); // Check if wrong key exists
    
    setDebug({
      authToken: authToken ? `${authToken.substring(0, 50)}...` : 'NOT FOUND',
      authTokenLength: authToken?.length || 0,
      userData: userData || 'NOT FOUND',
      accessToken: accessToken ? 'FOUND (wrong key!)' : 'not found',
      isLoggedIn: !!authToken,
      timestamp: new Date().toISOString(),
    });

    // Test API call
    if (authToken) {
      fetch('http://localhost:3001/bar/orders', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })
        .then((res) => {
          setDebug((prev: Record<string, any>) => ({
            ...prev,
            apiTest: {
              status: res.status,
              statusText: res.statusText,
              ok: res.ok,
            },
          }));
          return res.json();
        })
        .then((data) => {
          setDebug((prev: Record<string, any>) => ({
            ...prev,
            apiData: data,
          }));
        })
        .catch((err: Error) => {
          setDebug((prev: Record<string, any>) => ({
            ...prev,
            apiError: err.message,
          }));
        });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Bar Authentication Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">localStorage Status</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>

        {!debug.isLoggedIn && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              ❌ Not Logged In
            </h3>
            <p className="text-yellow-700 mb-4">
              No auth_token found in localStorage. You need to log in first.
            </p>
            <a
              href="/admin/login"
              className="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Go to Login Page
            </a>
          </div>
        )}

        {debug.isLoggedIn && debug.apiTest && (
          <div className={`border rounded-lg p-6 ${
            debug.apiTest.ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-2 ${
              debug.apiTest.ok ? 'text-green-800' : 'text-red-800'
            }`}>
              {debug.apiTest.ok ? '✅ API Call Success' : '❌ API Call Failed'}
            </h3>
            <p className={debug.apiTest.ok ? 'text-green-700' : 'text-red-700'}>
              Status: {debug.apiTest.status} {debug.apiTest.statusText}
            </p>
            {debug.apiError && (
              <p className="text-red-700 mt-2">Error: {debug.apiError}</p>
            )}
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Test Credentials</h3>
          <div className="text-blue-700 font-mono text-sm">
            <p>Email: admin@test.com</p>
            <p>Password: Admin@123</p>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="/bar"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ← Back to Bar Page
          </a>
        </div>
      </div>
    </div>
  );
}
