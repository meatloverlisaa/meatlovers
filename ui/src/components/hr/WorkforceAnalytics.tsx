"use client";
import { useEffect, useState } from "react";
import { getStaffDirectory, Employee } from "@/lib/hr";

export function WorkforceAnalytics() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [error, setError] = useState("");

  const load = () => {
    getStaffDirectory("active").then((s) => {
      setStaff(s);
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to load workforce data."));
  };

  useEffect(() => {
    load();
  }, []);

  // Mock analytics data
  const headcountByRole = [
    { role: "Chef", count: 8, percentage: 32 },
    { role: "Server", count: 10, percentage: 40 },
    { role: "Kitchen Staff", count: 5, percentage: 20 },
    { role: "Manager", count: 2, percentage: 8 }
  ];

  const headcountByDepartment = [
    { department: "Kitchen", count: 13, percentage: 52 },
    { department: "Front of House", count: 10, percentage: 40 },
    { department: "Management", count: 2, percentage: 8 }
  ];

  const turnoverData = {
    currentYear: 12,
    previousYear: 15,
    rate: 8.5
  };

  const retentionData = {
    sixMonths: 92,
    oneYear: 88,
    twoYears: 75
  };

  const averageTenure = 18; // months

  const diversityData = [
    { category: "Age 18-25", count: 8, percentage: 32 },
    { category: "Age 26-35", count: 10, percentage: 40 },
    { category: "Age 36-45", count: 5, percentage: 20 },
    { category: "Age 46+", count: 2, percentage: 8 }
  ];

  const genderData = [
    { gender: "Male", count: 14, percentage: 56 },
    { gender: "Female", count: 11, percentage: 44 }
  ];

  const workforceCost = {
    totalMonthly: 125000,
    perEmployee: 5000,
    benefits: 15000,
    training: 5000
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">HR analytics & reporting</p>
      <h1 className="mt-1 text-3xl font-black text-white">Workforce Analytics</h1>
      <p className="mt-2 text-sm text-zinc-400">Headcount reports, turnover rates, diversity metrics, and workforce cost analysis.</p>

      {error && <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Total Headcount</p>
          <p className="mt-2 text-3xl font-black text-white">{staff.length || 25}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Turnover Rate</p>
          <p className="mt-2 text-3xl font-black text-amber-400">{turnoverData.rate}%</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Avg Tenure</p>
          <p className="mt-2 text-3xl font-black text-blue-400">{averageTenure}mo</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Monthly Cost</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">${(workforceCost.totalMonthly / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* Headcount by Role */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Headcount by Role</h2>
        <p className="mt-1 text-sm text-zinc-400">Distribution of employees across different roles.</p>
        <div className="mt-4 space-y-3">
          {headcountByRole.map((item) => (
            <div key={item.role} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-zinc-300">{item.role}</div>
              <div className="flex-1">
                <div className="h-3 rounded-full bg-zinc-800">
                  <div className="h-3 rounded-full bg-blue-600" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
              <div className="w-20 text-right text-sm font-bold text-white">{item.count} ({item.percentage}%)</div>
            </div>
          ))}
        </div>
      </section>

      {/* Headcount by Department */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Headcount by Department</h2>
        <p className="mt-1 text-sm text-zinc-400">Distribution of employees across departments.</p>
        <div className="mt-4 space-y-3">
          {headcountByDepartment.map((item) => (
            <div key={item.department} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-zinc-300">{item.department}</div>
              <div className="flex-1">
                <div className="h-3 rounded-full bg-zinc-800">
                  <div className="h-3 rounded-full bg-emerald-600" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
              <div className="w-20 text-right text-sm font-bold text-white">{item.count} ({item.percentage}%)</div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Turnover & Retention */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Turnover & Retention</h2>
          <p className="mt-1 text-sm text-zinc-400">Employee turnover and retention metrics.</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-zinc-950 p-4">
              <p className="text-sm text-zinc-400">Turnover This Year</p>
              <p className="mt-1 text-2xl font-black text-amber-400">{turnoverData.currentYear} employees</p>
              <p className="text-sm text-zinc-400">vs {turnoverData.previousYear} last year</p>
            </div>
            <div className="rounded-lg bg-zinc-950 p-4">
              <p className="text-sm text-zinc-400">Retention Rate</p>
              <div className="mt-2 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-black text-emerald-400">{retentionData.sixMonths}%</p>
                  <p className="text-xs text-zinc-400">6 months</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-400">{retentionData.oneYear}%</p>
                  <p className="text-xs text-zinc-400">1 year</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-400">{retentionData.twoYears}%</p>
                  <p className="text-xs text-zinc-400">2 years</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diversity Reports */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Diversity Reports</h2>
          <p className="mt-1 text-sm text-zinc-400">Age and gender distribution analysis.</p>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-zinc-400 mb-2">Age Distribution</p>
              <div className="space-y-2">
                {diversityData.map((item) => (
                  <div key={item.category} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-zinc-300">{item.category}</div>
                    <div className="flex-1 h-2 rounded-full bg-zinc-800">
                      <div className="h-2 rounded-full bg-purple-600" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <div className="w-12 text-right text-xs font-bold text-white">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-400 mb-2">Gender Distribution</p>
              <div className="space-y-2">
                {genderData.map((item) => (
                  <div key={item.gender} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-zinc-300">{item.gender}</div>
                    <div className="flex-1 h-2 rounded-full bg-zinc-800">
                      <div className="h-2 rounded-full bg-pink-600" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <div className="w-12 text-right text-xs font-bold text-white">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Workforce Cost Analysis */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Workforce Cost Analysis</h2>
        <p className="mt-1 text-sm text-zinc-400">Monthly workforce cost breakdown.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Total Monthly</p>
            <p className="mt-1 text-2xl font-black text-white">${workforceCost.totalMonthly.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Per Employee</p>
            <p className="mt-1 text-2xl font-black text-blue-400">${workforceCost.perEmployee.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Benefits</p>
            <p className="mt-1 text-2xl font-black text-emerald-400">${workforceCost.benefits.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Training</p>
            <p className="mt-1 text-2xl font-black text-amber-400">${workforceCost.training.toLocaleString()}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
