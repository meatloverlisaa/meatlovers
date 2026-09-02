"use client";
import { useEffect, useState, useCallback } from "react";
import { getStaffDirectory, Employee } from "@/lib/hr";
import { IconRenderer } from "@/components/ui/IconRenderer";

export function DashboardMetrics() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    getStaffDirectory("active").then((s) => {
      setStaff(s);
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to load dashboard metrics."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Mock dashboard metrics
  const metrics = {
    totalActiveStaff: staff.length || 25,
    todayAttendance: 92,
    pendingLeaveRequests: 5,
    upcomingRosters: 3,
    payrollCycleStatus: "Processing",
    trainingCompliance: 87,
    openPositions: 2,
    recruitmentPipeline: 8
  };

  const recentActivity = [
    { type: "Attendance", description: "92% attendance recorded today", time: "2 hours ago" },
    { type: "Leave", description: "3 new leave requests submitted", time: "4 hours ago" },
    { type: "Recruitment", description: "2 candidates moved to interview stage", time: "6 hours ago" },
    { type: "Training", description: "5 employees completed safety training", time: "1 day ago" }
  ];

  const upcomingEvents = [
    { event: "Payroll Processing", date: "2024-02-28", priority: "High" },
    { event: "Performance Reviews", date: "2024-03-01", priority: "Medium" },
    { event: "Training Session", date: "2024-03-05", priority: "Low" },
    { event: "Contract Renewals", date: "2024-03-15", priority: "High" }
  ];

  const recruitmentPipeline = [
    { stage: "Applied", count: 15 },
    { stage: "Screening", count: 8 },
    { stage: "Interview", count: 5 },
    { stage: "Offer", count: 2 },
    { stage: "Hired", count: 0 }
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">HR analytics & reporting</p>
      <h1 className="mt-1 text-3xl font-black text-white">Dashboard Metrics</h1>
      <p className="mt-2 text-sm text-zinc-400">Real-time HR metrics including attendance, leave requests, and training compliance.</p>

      {error && <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}

      {/* Main Metrics Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Total Active Staff</p>
            <IconRenderer icon="people" className="w-6 h-6" />
          </div>
          <p className="mt-2 text-3xl font-black text-white">{metrics.totalActiveStaff}</p>
          <p className="mt-1 text-xs text-emerald-400">+2 from last month</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Today&apos;s Attendance</p>
            <IconRenderer icon="calendar" className="w-6 h-6" />
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-400">{metrics.todayAttendance}%</p>
          <p className="mt-1 text-xs text-zinc-400">{Math.round(metrics.totalActiveStaff * metrics.todayAttendance / 100)} present</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Pending Leave Requests</p>
            <IconRenderer icon="clipboard" className="w-6 h-6" />
          </div>
          <p className="mt-2 text-3xl font-black text-amber-400">{metrics.pendingLeaveRequests}</p>
          <p className="mt-1 text-xs text-zinc-400">Awaiting approval</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Training Compliance</p>
            <IconRenderer icon="training" className="w-6 h-6" />
          </div>
          <p className="mt-2 text-3xl font-black text-blue-400">{metrics.trainingCompliance}%</p>
          <p className="mt-1 text-xs text-zinc-400">Mandatory training</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Upcoming Rosters</p>
            <IconRenderer icon="calendar" className="w-6 h-6" />
          </div>
          <p className="mt-2 text-3xl font-black text-white">{metrics.upcomingRosters}</p>
          <p className="mt-1 text-xs text-zinc-400">Next 7 days</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Payroll Status</p>
            <IconRenderer icon="money" className="w-6 h-6" />
          </div>
          <p className="mt-2 text-3xl font-black text-emerald-400">{metrics.payrollCycleStatus}</p>
          <p className="mt-1 text-xs text-zinc-400">Due in 3 days</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Open Positions</p>
            <IconRenderer icon="briefcase" className="w-6 h-6" />
          </div>
          <p className="mt-2 text-3xl font-black text-amber-400">{metrics.openPositions}</p>
          <p className="mt-1 text-xs text-zinc-400">Actively hiring</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">Recruitment Pipeline</p>
            <span className="text-2xl">Chart</span>
          </div>
          <p className="mt-2 text-3xl font-black text-blue-400">{metrics.recruitmentPipeline}</p>
          <p className="mt-1 text-xs text-zinc-400">Candidates in process</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Recent Activity</h2>
          <p className="mt-1 text-sm text-zinc-400">Latest HR activities and updates.</p>
          <div className="mt-4 space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 rounded-lg bg-zinc-950 p-3">
                <span className="text-xl">📌</span>
                <div className="flex-1">
                  <p className="font-bold text-white">{activity.type}</p>
                  <p className="text-sm text-zinc-400">{activity.description}</p>
                </div>
                <span className="text-xs text-zinc-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Upcoming Events</h2>
          <p className="mt-1 text-sm text-zinc-400">Important HR events and deadlines.</p>
          <div className="mt-4 space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg bg-zinc-950 p-3">
                <div>
                  <p className="font-bold text-white">{event.event}</p>
                  <p className="text-sm text-zinc-400">{event.date}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                  event.priority === "High" ? "bg-red-900 text-red-400" :
                  event.priority === "Medium" ? "bg-amber-900 text-amber-400" :
                  "bg-zinc-800 text-zinc-400"
                }`}>
                  {event.priority}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recruitment Pipeline */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Recruitment Pipeline</h2>
        <p className="mt-1 text-sm text-zinc-400">Track candidates through the hiring process.</p>
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
          {recruitmentPipeline.map((stage, index) => (
            <div key={stage.stage} className="flex-shrink-0 w-32">
              <div className="rounded-lg bg-zinc-950 p-4 text-center">
                <p className="text-2xl font-black text-white">{stage.count}</p>
                <p className="mt-1 text-xs text-zinc-400">{stage.stage}</p>
              </div>
              {index < recruitmentPipeline.length - 1 && (
                <div className="flex justify-center py-2">
                  <span className="text-zinc-600">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Quick Stats</h2>
        <p className="mt-1 text-sm text-zinc-400">Summary of key HR indicators.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-lg bg-zinc-950 p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">95%</p>
            <p className="mt-1 text-xs text-zinc-400">Retention Rate</p>
          </div>
          <div className="rounded-lg bg-zinc-950 p-4 text-center">
            <p className="text-2xl font-black text-blue-400">18mo</p>
            <p className="mt-1 text-xs text-zinc-400">Avg Tenure</p>
          </div>
          <div className="rounded-lg bg-zinc-950 p-4 text-center">
            <p className="text-2xl font-black text-amber-400">8.5%</p>
            <p className="mt-1 text-xs text-zinc-400">Turnover Rate</p>
          </div>
          <div className="rounded-lg bg-zinc-950 p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">92%</p>
            <p className="mt-1 text-xs text-zinc-400">Attendance Rate</p>
          </div>
          <div className="rounded-lg bg-zinc-950 p-4 text-center">
            <p className="text-2xl font-black text-purple-400">56%</p>
            <p className="mt-1 text-xs text-zinc-400">Gender Balance</p>
          </div>
          <div className="rounded-lg bg-zinc-950 p-4 text-center">
            <p className="text-2xl font-black text-blue-400">$5k</p>
            <p className="mt-1 text-xs text-zinc-400">Avg Salary</p>
          </div>
        </div>
      </section>
    </main>
  );
}
