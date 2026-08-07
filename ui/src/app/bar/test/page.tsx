'use client';

import { useEffect, useState } from 'react';

export default function BarTestPage() {
  const [status, setStatus] = useState('Initializing...');
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    async function test() {
      const steps: string[] = [];
      const errs: string[] = [];
      
      try {
        // Step 1: Check token
        steps.push('Checking localStorage for auth_token...');
        const authToken = localStorage.getItem('auth_token');
        setToken(authToken);
        
        if (!authToken) {
          errs.push('❌ No auth_token found in localStorage');
          steps.push('❌ Not logged in');
        } else {
          steps.push(`✅ Token found: ${authToken.substring(0, 30)}...`);
          
          // Step 2: Test bar orders API
          steps.push('Fetching bar orders...');
          try {
            const ordersRes = await fetch('http://localhost:3001/bar/orders', {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            steps.push(`Orders API status: ${ordersRes.status} ${ordersRes.statusText}`);
            
            if (ordersRes.ok) {
              const ordersData = await ordersRes.json();
              setOrders(ordersData);
              steps.push(`✅ Orders loaded: ${Array.isArray(ordersData) ? ordersData.length : 0} orders`);
            } else {
              const errorText = await ordersRes.text();
              errs.push(`❌ Orders API failed: ${ordersRes.status} - ${errorText}`);
            }
          } catch (_err) {
            errs.push(`❌ Orders API error: ${err instanceof Error ? _err.message : String(err)}`);
          }
          
          // Step 3: Test bar summary API
          steps.push('Fetching bar summary...');
          try {
            const summaryRes = await fetch('http://localhost:3001/bar/summary', {
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            steps.push(`Summary API status: ${summaryRes.status} ${summaryRes.statusText}`);
            
            if (summaryRes.ok) {
              const summaryData = await summaryRes.json();
              setSummary(summaryData);
              steps.push(`✅ Summary loaded`);
            } else {
              const errorText = await summaryRes.text();
              errs.push(`❌ Summary API failed: ${summaryRes.status} - ${errorText}`);
            }
          } catch (_err) {
            errs.push(`❌ Summary API error: ${err instanceof Error ? _err.message : String(err)}`);
          }
        }
      } catch (_err) {
        errs.push(`❌ General error: ${err instanceof Error ? _err.message : String(err)}`);
      }
      
      setStatus(steps.join('\n'));
      setErrors(errs);
    }
    
    test();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bar Dashboard Test</h1>
          <p className="text-gray-600">Diagnostic page to debug authentication and API calls</p>
        </div>

        {/* Status Log */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Status Log</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap font-mono">
            {status}
          </pre>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">Errors</h2>
            <ul className="space-y-2">
              {errors.map((err, i) => (
                <li key={i} className="text-red-700 font-mono text-sm">{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Token Info */}
        {token && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Authentication Token</h2>
            <p className="text-green-700 font-mono text-xs break-all">{token}</p>
          </div>
        )}

        {!token && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">⚠️ Not Logged In</h2>
            <p className="text-yellow-700 mb-4">
              You need to set an auth token in localStorage. Run this in the browser console:
            </p>
            <pre className="bg-yellow-100 p-4 rounded text-xs overflow-x-auto">
{`localStorage.setItem('auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDQiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzgzOTI2MjIwLCJleHAiOjE3ODM5NTUwMjB9.lW_-k-eoCSZp3zsDIP0t0hVpdp-k_PHo9VEcWUI-8hA');
location.reload();`}
            </pre>
          </div>
        )}

        {/* Orders Data */}
        {orders && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bar Orders Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(orders, null, 2)}
            </pre>
          </div>
        )}

        {/* Summary Data */}
        {summary && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bar Summary Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(summary, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <a
            href="/admin/login"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login Page
          </a>
          <a
            href="/bar"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Go to Bar Dashboard
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Refresh Test
          </button>
        </div>
      </div>
    </div>
  );
}
