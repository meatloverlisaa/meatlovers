"use client";

import { FormEvent, useEffect, useState, useCallback } from "react";
import {
  createRoster,
  DutyRoster,
  Employee,
  getRoster,
  getStaffDirectory,
  readable,
} from "@/lib/hr";

const today = new Date().toISOString().slice(0, 10);
const shifts = ["MORNING", "AFTERNOON", "NIGHT", "FULL_DAY", "SPLIT"];

export function RosterPlanning() {
  const [date, setDate] = useState(today);
  const [roster, setRoster] = useState<DutyRoster[]>([]);
  const [staff, setStaff] = useState<Employee[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    shift_type: "MORNING",
    start_time: "06:00",
    end_time: "14:00",
    notes: "",
  });

  const load = useCallback(async () => {
    try {
      const [entries, employees] = await Promise.all([
        getRoster(date),
        getStaffDirectory("active"),
      ]);
      setRoster(entries);
      setStaff(employees);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load roster.");
    }
  }, [date]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (mounted) {
        await load();
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [load]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await createRoster({ ...form, shift_date: date });
      setForm({
        user_id: "",
        shift_type: "MORNING",
        start_time: "06:00",
        end_time: "14:00",
        notes: "",
      });
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign shift.",
      );
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-blue-400">
        Duty roster & shift management
      </p>
      <h1 className="mt-1 text-3xl font-black text-white">Shift planning</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Assign shifts and review daily staff coverage.
      </p>

      {error && (
        <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-800 p-3 text-sm text-blue-400">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Assign a shift</h2>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block text-sm font-semibold text-zinc-400">
              Employee
              <select
                required
                value={form.user_id}
                onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white"
              >
                <option value="">Select employee</option>
                {staff.map((s) => (
                  <option key={String(s.id)} value={String(s.id)}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-zinc-400">
              Shift type
              <select
                value={form.shift_type}
                onChange={(e) =>
                  setForm({ ...form, shift_type: e.target.value })
                }
                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white"
              >
                {shifts.map((s) => (
                  <option key={s}>{readable(s)}</option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold text-zinc-400">
                Start
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                  className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white"
                />
              </label>

              <label className="text-sm font-semibold text-zinc-400">
                End
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white"
                />
              </label>
            </div>

            <label className="block text-sm font-semibold text-zinc-400">
              Notes
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white"
              />
            </label>

            <button className="w-full rounded bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
              Assign shift
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 p-5">
            <div>
              <h2 className="font-black text-white">Daily roster</h2>
              <p className="text-sm text-zinc-400">{date}</p>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-800 p-2 text-sm text-white"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-950 text-xs uppercase text-zinc-400">
                <tr>
                  <th className="px-4 py-3 text-left">Employee</th>
                  <th className="px-4 py-3 text-left">Shift</th>
                  <th className="px-4 py-3 text-left">Times</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {roster.length ? (
                  roster.map((r) => (
                    <tr key={String(r.id)}>
                      <td className="px-4 py-3 font-bold text-white">
                        {r.user.full_name}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {readable(r.shift_type)}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {r.start_time.slice(0, 5)} - {r.end_time.slice(0, 5)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                      No shifts assigned for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
