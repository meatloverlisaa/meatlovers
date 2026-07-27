"use client";
import { FormEvent, useEffect, useState } from "react";
import { getStaffDirectory, Employee, readable } from "@/lib/hr";

const awardTypes = ["Employee of the Month", "Employee of the Quarter", "Performance Bonus", "Achievement Badge", "Certificate of Excellence", "Special Recognition"];
const badgeTypes = ["Team Player", "Customer Service Star", "Innovation Award", "Safety Champion", "Leadership Award", "Mentor of the Year"];

export function RewardsRecognition() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    award_type: "Employee of the Month",
    period: "",
    reason: "",
    bonus_amount: "",
    badge_type: ""
  });

  const load = () => {
    getStaffDirectory("active").then((s) => {
      setStaff(s);
      // Mock rewards data - in production, this would come from the API
      const mockRewards = [
        {
          id: 1,
          user: s[0],
          award_type: "Employee of the Month",
          period: "January 2024",
          reason: "Exceptional customer service and team leadership",
          created_at: "2024-01-31"
        },
        {
          id: 2,
          user: s[1],
          award_type: "Performance Bonus",
          period: "Q4 2023",
          reason: "Exceeded sales targets by 25%",
          bonus_amount: "5000",
          created_at: "2024-01-15"
        }
      ];
      setRewards(mockRewards);
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to load rewards data."));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to save reward
      const newReward = {
        id: Date.now(),
        user: staff.find((s) => String(s.id) === form.user_id),
        award_type: form.award_type,
        period: form.period,
        reason: form.reason,
        bonus_amount: form.bonus_amount,
        badge_type: form.badge_type,
        created_at: new Date().toISOString()
      };
      setRewards([newReward, ...rewards]);
      setForm({
        user_id: "",
        award_type: "Employee of the Month",
        period: "",
        reason: "",
        bonus_amount: "",
        badge_type: ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit reward.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">Performance management</p>
      <h1 className="mt-1 text-3xl font-black text-white">Rewards & Recognition</h1>
      <p className="mt-2 text-sm text-zinc-400">Manage employee recognition programs, awards, bonuses, and achievement badges.</p>

      {error && <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Total Awards Given</p>
          <p className="mt-2 text-3xl font-black text-white">{rewards.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Total Bonus Paid</p>
          <p className="mt-2 text-3xl font-black text-blue-400">
            {rewards.reduce((sum, r) => sum + (Number(r.bonus_amount) || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">This Month</p>
          <p className="mt-2 text-3xl font-black text-white">{rewards.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Award Form */}
        <form onSubmit={submit} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm space-y-4">
          <h2 className="font-black text-white">Grant Award or Recognition</h2>
          
          <label className="block text-sm font-semibold text-zinc-400">Employee</label>
          <select required value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            <option value="">Select employee</option>
            {staff.map((s) => <option key={String(s.id)} value={String(s.id)}>{s.full_name}</option>)}
          </select>

          <label className="block text-sm font-semibold text-zinc-400">Award Type</label>
          <select value={form.award_type} onChange={(e) => setForm({ ...form, award_type: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            {awardTypes.map((t) => <option key={t}>{t}</option>)}
          </select>

          <label className="block text-sm font-semibold text-zinc-400">Period</label>
          <input required type="text" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="e.g., January 2024" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Reason</label>
          <textarea rows={3} required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Describe the achievement or reason for recognition" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          {form.award_type === "Performance Bonus" && (
            <>
              <label className="block text-sm font-semibold text-zinc-400">Bonus Amount</label>
              <input type="number" value={form.bonus_amount} onChange={(e) => setForm({ ...form, bonus_amount: e.target.value })} placeholder="Enter amount" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />
            </>
          )}

          {form.award_type === "Achievement Badge" && (
            <>
              <label className="block text-sm font-semibold text-zinc-400">Badge Type</label>
              <select value={form.badge_type} onChange={(e) => setForm({ ...form, badge_type: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
                <option value="">Select badge</option>
                {badgeTypes.map((b) => <option key={b}>{b}</option>)}
              </select>
            </>
          )}

          <button className="w-full rounded bg-blue-600 py-2 text-white font-bold hover:bg-blue-700">Grant Award</button>
        </form>

        {/* Recent Awards */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Recent Awards & Recognition</h2>
          <p className="mt-1 text-sm text-zinc-400">View and manage all granted awards.</p>
          <div className="mt-4 divide-y divide-zinc-800">
            {rewards.length === 0 ? (
              <p className="py-8 text-center text-zinc-500">No awards granted yet.</p>
            ) : (
              rewards.map((reward) => (
                <div key={reward.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <p className="font-bold text-white">{reward.user?.full_name}</p>
                      </div>
                      <p className="mt-1 text-sm text-blue-400 font-semibold">{reward.award_type}</p>
                      <p className="mt-1 text-sm text-zinc-400">{reward.period}</p>
                      <p className="mt-2 text-sm text-zinc-300">{reward.reason}</p>
                      {reward.bonus_amount && (
                        <p className="mt-2 text-sm font-bold text-emerald-400">Bonus: {Number(reward.bonus_amount).toLocaleString()}</p>
                      )}
                      {reward.badge_type && (
                        <span className="mt-2 inline-block rounded-full bg-blue-900 px-3 py-1 text-xs font-bold text-blue-400">
                          {reward.badge_type}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500">{new Date(reward.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Recognition Announcements */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Recognition Announcements</h2>
        <p className="mt-1 text-sm text-zinc-400">Create and manage public recognition announcements.</p>
        <div className="mt-4 rounded-lg bg-zinc-950 p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-bold text-white">Congratulations to our Employee of the Month!</p>
              <p className="text-sm text-zinc-400">Recognition will be displayed here when awards are granted.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
