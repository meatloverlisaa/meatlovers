"use client";
import { useEffect, useState } from "react";
import { getStaffDirectory, Employee } from "@/lib/hr";

export function ComplianceReports() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [error, setError] = useState("");

  const load = () => {
    getStaffDirectory("active").then((s) => {
      setStaff(s);
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to load compliance data."));
  };

  useEffect(() => {
    load();
  }, []);

  // Mock compliance data
  const contractCompliance = [
    { id: 1, employee: "John Doe", contract_type: "Full-time", status: "Compliant", expiry_date: "2024-12-31" },
    { id: 2, employee: "Jane Smith", contract_type: "Part-time", status: "Expiring Soon", expiry_date: "2024-03-15" },
    { id: 3, employee: "Mike Johnson", contract_type: "Full-time", status: "Compliant", expiry_date: "2025-06-30" }
  ];

  const statutoryContributions = {
    pension: { required: 12500, paid: 12500, status: "Compliant" },
    health_insurance: { required: 8500, paid: 8500, status: "Compliant" },
    social_security: { required: 5000, paid: 4800, status: "Underpaid" },
    tax_withholding: { required: 18000, paid: 18000, status: "Compliant" }
  };

  const leaveBalanceAudits = [
    { employee: "John Doe", annual_leave: { used: 10, balance: 12, status: "Normal" }, sick_leave: { used: 3, balance: 7, status: "Normal" } },
    { employee: "Jane Smith", annual_leave: { used: 15, balance: 7, status: "Low" }, sick_leave: { used: 5, balance: 5, status: "Normal" } },
    { employee: "Mike Johnson", annual_leave: { used: 8, balance: 14, status: "Normal" }, sick_leave: { used: 2, balance: 8, status: "Normal" } }
  ];

  const overtimeCompliance = [
    { employee: "John Doe", hours_this_month: 8, limit: 10, status: "Compliant" },
    { employee: "Jane Smith", hours_this_month: 12, limit: 10, status: "Over Limit" },
    { employee: "Mike Johnson", hours_this_month: 5, limit: 10, status: "Compliant" }
  ];

  const workingHoursCompliance = {
    total_employees: staff.length || 25,
    compliant: 23,
    non_compliant: 2,
    avg_weekly_hours: 42,
    legal_limit: 48
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">HR analytics & reporting</p>
      <h1 className="mt-1 text-3xl font-black text-white">Compliance Reports</h1>
      <p className="mt-2 text-sm text-zinc-400">Employment contract compliance, statutory contributions, and leave balance audits.</p>

      {error && <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Contract Compliance</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">{Math.round((contractCompliance.filter((c) => c.status === "Compliant").length / contractCompliance.length) * 100)}%</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Statutory Payments</p>
          <p className="mt-2 text-3xl font-black text-blue-400">3/4</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Overtime Compliance</p>
          <p className="mt-2 text-3xl font-black text-amber-400">{Math.round((overtimeCompliance.filter((o) => o.status === "Compliant").length / overtimeCompliance.length) * 100)}%</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Working Hours</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">{workingHoursCompliance.compliant}/{workingHoursCompliance.total_employees}</p>
        </div>
      </div>

      {/* Employment Contract Compliance */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Employment Contract Compliance</h2>
        <p className="mt-1 text-sm text-zinc-400">Track contract status and expiry dates.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-950 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Contract Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {contractCompliance.map((contract) => (
                <tr key={contract.id}>
                  <td className="px-4 py-3 font-bold text-white">{contract.employee}</td>
                  <td className="px-4 py-3 text-zinc-300">{contract.contract_type}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                      contract.status === "Compliant" ? "bg-emerald-900 text-emerald-400" :
                      contract.status === "Expiring Soon" ? "bg-amber-900 text-amber-400" :
                      "bg-red-900 text-red-400"
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{contract.expiry_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Statutory Contribution Reports */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Statutory Contribution Reports</h2>
        <p className="mt-1 text-sm text-zinc-400">Track mandatory statutory payments and contributions.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(statutoryContributions).map(([key, data]) => (
            <div key={key} className="rounded-lg bg-zinc-950 p-4">
              <p className="text-sm font-semibold text-zinc-400 capitalize">{key.replace(/_/g, " ")}</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Required: ${data.required.toLocaleString()}</span>
                  <span className="text-zinc-400">Paid: ${data.paid.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800">
                  <div 
                    className={`h-2 rounded-full ${data.status === "Compliant" ? "bg-emerald-600" : "bg-red-600"}`}
                    style={{ width: `${Math.min((data.paid / data.required) * 100, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${data.status === "Compliant" ? "text-emerald-400" : "text-red-400"}`}>
                  {data.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leave Balance Audits */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Leave Balance Audits</h2>
        <p className="mt-1 text-sm text-zinc-400">Monitor leave balances and usage patterns.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-950 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Annual Used</th>
                <th className="px-4 py-3">Annual Balance</th>
                <th className="px-4 py-3">Sick Used</th>
                <th className="px-4 py-3">Sick Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {leaveBalanceAudits.map((audit, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 font-bold text-white">{audit.employee}</td>
                  <td className="px-4 py-3 text-zinc-300">{audit.annual_leave.used} days</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${audit.annual_leave.status === "Low" ? "text-amber-400" : "text-emerald-400"}`}>
                      {audit.annual_leave.balance} days
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{audit.sick_leave.used} days</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">{audit.sick_leave.balance} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Overtime Regulation Compliance */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Overtime Regulation Compliance</h2>
          <p className="mt-1 text-sm text-zinc-400">Track overtime hours against regulatory limits.</p>
          <div className="mt-4 space-y-3">
            {overtimeCompliance.map((item, index) => (
              <div key={index} className="rounded-lg bg-zinc-950 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">{item.employee}</p>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                    item.status === "Compliant" ? "bg-emerald-900 text-emerald-400" : "bg-red-900 text-red-400"
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm">
                  <span className="text-zinc-400">Hours: {item.hours_this_month}</span>
                  <span className="text-zinc-400">Limit: {item.limit}</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-800">
                    <div 
                      className={`h-2 rounded-full ${item.status === "Compliant" ? "bg-emerald-600" : "bg-red-600"}`}
                      style={{ width: `${Math.min((item.hours_this_month / item.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Working Hours Compliance */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Working Hours Compliance</h2>
          <p className="mt-1 text-sm text-zinc-400">Monitor compliance with labor law working hour limits.</p>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg bg-zinc-950 p-4">
              <p className="text-sm text-zinc-400">Total Employees</p>
              <p className="mt-1 text-2xl font-black text-white">{workingHoursCompliance.total_employees}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-zinc-950 p-4">
                <p className="text-sm text-zinc-400">Compliant</p>
                <p className="mt-1 text-2xl font-black text-emerald-400">{workingHoursCompliance.compliant}</p>
              </div>
              <div className="rounded-lg bg-zinc-950 p-4">
                <p className="text-sm text-zinc-400">Non-Compliant</p>
                <p className="mt-1 text-2xl font-black text-red-400">{workingHoursCompliance.non_compliant}</p>
              </div>
            </div>
            <div className="rounded-lg bg-zinc-950 p-4">
              <p className="text-sm text-zinc-400">Average Weekly Hours</p>
              <div className="mt-2 flex items-center gap-4">
                <p className="text-2xl font-black text-blue-400">{workingHoursCompliance.avg_weekly_hours}h</p>
                <span className="text-zinc-400">/ Legal Limit: {workingHoursCompliance.legal_limit}h</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-zinc-800">
                <div 
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${Math.min((workingHoursCompliance.avg_weekly_hours / workingHoursCompliance.legal_limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
