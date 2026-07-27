"use client";
import { FormEvent, useEffect, useState } from "react";
import { getStaffDirectory, Employee, readable } from "@/lib/hr";

export function CareerDevelopment() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    current_role: "",
    target_role: "",
    skill_gaps: "",
    development_plan: "",
    mentor_id: ""
  });

  const load = () => {
    getStaffDirectory("active").then((s) => {
      setStaff(s);
      // Mock career paths data
      const mockPaths = s.slice(0, 4).map((employee, index) => ({
        id: index + 1,
        user: employee,
        current_role: readable(employee.role),
        target_role: ["Senior Chef", "Restaurant Manager", "Head Chef", "Operations Lead"][index],
        skill_gaps: ["Leadership skills", "Financial management", "Advanced culinary techniques", "Strategic planning"][index],
        status: ["In Progress", "Planning", "In Progress", "Completed"][index],
        progress: [60, 25, 45, 100][index]
      }));
      setCareerPaths(mockPaths);

      // Mock promotions data
      const mockPromotions = [
        { id: 1, user: s[0], from_role: "Line Cook", to_role: "Senior Chef", date: "2024-01-15" },
        { id: 2, user: s[1], from_role: "Server", to_role: "Team Lead", date: "2024-02-01" }
      ];
      setPromotions(mockPromotions);
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to load career development data."));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to save career development plan
      const newPath = {
        id: Date.now(),
        user: staff.find((s) => String(s.id) === form.user_id),
        current_role: form.current_role,
        target_role: form.target_role,
        skill_gaps: form.skill_gaps,
        status: "Planning",
        progress: 0
      };
      setCareerPaths([newPath, ...careerPaths]);
      setForm({
        user_id: "",
        current_role: "",
        target_role: "",
        skill_gaps: "",
        development_plan: "",
        mentor_id: ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create career development plan.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">Training & development</p>
      <h1 className="mt-1 text-3xl font-black text-white">Career Development</h1>
      <p className="mt-2 text-sm text-zinc-400">Plan career paths, track promotions, and manage mentorship programs.</p>

      {error && <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Active Plans</p>
          <p className="mt-2 text-3xl font-black text-white">{careerPaths.filter((p) => p.status !== "Completed").length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Promotions (YTD)</p>
          <p className="mt-2 text-3xl font-black text-emerald-400">{promotions.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Completed Paths</p>
          <p className="mt-2 text-3xl font-black text-blue-400">{careerPaths.filter((p) => p.status === "Completed").length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Avg Progress</p>
          <p className="mt-2 text-3xl font-black text-amber-400">
            {careerPaths.length > 0 
              ? Math.round(careerPaths.reduce((sum, p) => sum + p.progress, 0) / careerPaths.length) 
              : 0}%
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Create Career Plan Form */}
        <form onSubmit={submit} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm space-y-4">
          <h2 className="font-black text-white">Create Career Development Plan</h2>
          
          <label className="block text-sm font-semibold text-zinc-400">Employee</label>
          <select required value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            <option value="">Select employee</option>
            {staff.map((s) => <option key={String(s.id)} value={String(s.id)}>{s.full_name}</option>)}
          </select>

          <label className="block text-sm font-semibold text-zinc-400">Current Role</label>
          <input required type="text" value={form.current_role} onChange={(e) => setForm({ ...form, current_role: e.target.value })} placeholder="Current position" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Target Role</label>
          <input required type="text" value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} placeholder="Desired position" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Skill Gaps</label>
          <textarea rows={3} value={form.skill_gaps} onChange={(e) => setForm({ ...form, skill_gaps: e.target.value })} placeholder="Identify skills to develop" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Development Plan</label>
          <textarea rows={3} value={form.development_plan} onChange={(e) => setForm({ ...form, development_plan: e.target.value })} placeholder="Outline development activities" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Mentor</label>
          <select value={form.mentor_id} onChange={(e) => setForm({ ...form, mentor_id: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            <option value="">Assign mentor (optional)</option>
            {staff.map((s) => <option key={String(s.id)} value={String(s.id)}>{s.full_name}</option>)}
          </select>

          <button className="w-full rounded bg-blue-600 py-2 text-white font-bold hover:bg-blue-700">Create Plan</button>
        </form>

        {/* Career Paths */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Career Development Plans</h2>
          <p className="mt-1 text-sm text-zinc-400">View and manage employee career paths and progress.</p>
          <div className="mt-4 space-y-4">
            {careerPaths.length === 0 ? (
              <p className="py-8 text-center text-zinc-500">No career development plans created yet.</p>
            ) : (
              careerPaths.map((path) => (
                <div key={path.id} className="rounded-lg bg-zinc-950 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-white">{path.user.full_name}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="text-zinc-400">{path.current_role}</span>
                        <span className="text-blue-400">→</span>
                        <span className="text-emerald-400 font-semibold">{path.target_role}</span>
                      </div>
                      <p className="mt-2 text-sm text-zinc-400">Skill gaps: {path.skill_gaps}</p>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-zinc-400">Progress</span>
                          <span className="text-white font-bold">{path.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-800">
                          <div 
                            className="h-2 rounded-full bg-blue-600 transition-all" 
                            style={{ width: `${path.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      path.status === "Completed" ? "bg-emerald-900 text-emerald-400" :
                      path.status === "In Progress" ? "bg-blue-900 text-blue-400" :
                      "bg-zinc-800 text-zinc-400"
                    }`}>
                      {path.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Recent Promotions */}
      <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
        <h2 className="font-black text-white">Recent Promotions</h2>
        <p className="mt-1 text-sm text-zinc-400">Track internal promotions and role changes.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-950 text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">From Role</th>
                <th className="px-4 py-3">To Role</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {promotions.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No promotions recorded yet.</td></tr>
              ) : (
                promotions.map((promo) => (
                  <tr key={promo.id}>
                    <td className="px-4 py-3 font-bold text-white">{promo.user.full_name}</td>
                    <td className="px-4 py-3 text-zinc-300">{promo.from_role}</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">{promo.to_role}</td>
                    <td className="px-4 py-3 text-zinc-300">{promo.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
