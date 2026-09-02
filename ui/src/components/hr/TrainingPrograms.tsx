"use client";
import { FormEvent, useEffect, useState } from "react";
import { getStaffDirectory, Employee } from "@/lib/hr";

const trainingTypes = [
  "Onboarding Training",
  "Role-Specific Skill Training",
  "Safety and Hygiene Training",
  "Customer Service Training",
  "Leadership Development",
  "Cross-Training"
];

export function TrainingPrograms() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    training_type: "Onboarding Training",
    description: "",
    duration: "",
    mandatory: false,
    start_date: "",
    end_date: ""
  });

  const load = () => {
    getStaffDirectory("active").then((s) => {
      setStaff(s);
      // Mock training programs data
      const mockPrograms = [
        {
          id: 1,
          title: "Food Safety Certification",
          training_type: "Safety and Hygiene Training",
          description: "Mandatory food handling and safety certification",
          duration: "8 hours",
          mandatory: true,
          start_date: "2024-02-01",
          end_date: "2024-02-01",
          enrolled_count: 12,
          completed_count: 8
        },
        {
          id: 2,
          title: "Customer Service Excellence",
          training_type: "Customer Service Training",
          description: "Enhancing customer interaction skills",
          duration: "4 hours",
          mandatory: false,
          start_date: "2024-02-15",
          end_date: "2024-02-15",
          enrolled_count: 15,
          completed_count: 10
        }
      ];
      setPrograms(mockPrograms);
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to load training programs."));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to save training program
      const newProgram = {
        id: Date.now(),
        ...form,
        enrolled_count: 0,
        completed_count: 0
      };
      setPrograms([newProgram, ...programs]);
      setForm({
        title: "",
        training_type: "Onboarding Training",
        description: "",
        duration: "",
        mandatory: false,
        start_date: "",
        end_date: ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create training program.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">Training & development</p>
      <h1 className="mt-1 text-3xl font-black text-white">Training Programs</h1>
      <p className="mt-2 text-sm text-zinc-400">Manage onboarding, skill training, safety, and leadership development programs.</p>

      {error && <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">{error}</div>}

      {/* Summary Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Total Programs</p>
          <p className="mt-2 text-3xl font-black text-white">{programs.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Mandatory Programs</p>
          <p className="mt-2 text-3xl font-black text-red-400">{programs.filter((p) => p.mandatory).length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-400">Total Enrolled</p>
          <p className="mt-2 text-3xl font-black text-blue-400">{programs.reduce((sum, p) => sum + p.enrolled_count, 0)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Create Program Form */}
        <form onSubmit={submit} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm space-y-4">
          <h2 className="font-black text-white">Create Training Program</h2>
          
          <label className="block text-sm font-semibold text-zinc-400">Program Title</label>
          <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter program title" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Training Type</label>
          <select value={form.training_type} onChange={(e) => setForm({ ...form, training_type: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            {trainingTypes.map((t) => <option key={t}>{t}</option>)}
          </select>

          <label className="block text-sm font-semibold text-zinc-400">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the training program" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Duration</label>
          <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g., 8 hours, 2 days" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <div className="flex items-center gap-2">
            <input type="checkbox" id="mandatory" checked={form.mandatory} onChange={(e) => setForm({ ...form, mandatory: e.target.checked })} className="rounded border-zinc-700 bg-zinc-800" />
            <label htmlFor="mandatory" className="text-sm font-semibold text-zinc-400">Mandatory Training</label>
          </div>

          <label className="block text-sm font-semibold text-zinc-400">Start Date</label>
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">End Date</label>
          <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <button className="w-full rounded bg-blue-600 py-2 text-white font-bold hover:bg-blue-700">Create Program</button>
        </form>

        {/* Programs List */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Training Programs</h2>
          <p className="mt-1 text-sm text-zinc-400">View and manage all training programs.</p>
          <div className="mt-4 divide-y divide-zinc-800">
            {programs.length === 0 ? (
              <p className="py-8 text-center text-zinc-500">No training programs created yet.</p>
            ) : (
              programs.map((program) => (
                <div key={program.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-violet-400">Program</span>
                        <p className="font-bold text-white">{program.title}</p>
                        {program.mandatory && <span className="rounded-full bg-red-900 px-2 py-1 text-xs font-bold text-red-400">Mandatory</span>}
                      </div>
                      <p className="mt-1 text-sm text-blue-400 font-semibold">{program.training_type}</p>
                      <p className="mt-1 text-sm text-zinc-400">{program.description}</p>
                      <p className="mt-2 text-sm text-zinc-300">Duration: {program.duration} · {program.start_date} to {program.end_date}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="text-zinc-400">Enrolled: {program.enrolled_count}</span>
                        <span className="text-emerald-400">Completed: {program.completed_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
