"use client";
import { FormEvent, useEffect, useState } from "react";
import { getStaffDirectory, Employee, readable } from "@/lib/hr";

const reviewTypes = ["Quarterly","Annual","360-Degree","Competency Assessment","PIP"];
const ratingScale = ["1 - Needs Improvement", "2 - Below Expectations", "3 - Meets Expectations", "4 - Exceeds Expectations", "5 - Outstanding"];

export function PerformanceReviews() {
  const [staff, setStaff] = useState<Employee[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    user_id: "",
    review_type: "Quarterly",
    review_period: "",
    overall_rating: "3",
    goals_achieved: "",
    strengths: "",
    areas_for_improvement: "",
    feedback: "",
    next_goals: ""
  });

  const load = () => {
    getStaffDirectory("active").then((s) => {
      setStaff(s);
    }).catch((e) => setError(e instanceof Error ? e.message : "Unable to load staff."));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implement API call to save performance review
      const newReview = {
        id: Date.now(),
        user: staff.find((s) => String(s.id) === form.user_id),
        review_type: form.review_type,
        review_period: form.review_period,
        overall_rating: form.overall_rating,
        created_at: new Date().toISOString()
      };
      setReviews([newReview, ...reviews]);
      setForm({
        user_id: "",
        review_type: "Quarterly",
        review_period: "",
        overall_rating: "3",
        goals_achieved: "",
        strengths: "",
        areas_for_improvement: "",
        feedback: "",
        next_goals: ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit performance review.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="text-sm font-semibold text-blue-400">Performance management</p>
      <h1 className="mt-1 text-3xl font-black text-white">Performance Reviews</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <form onSubmit={submit} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm space-y-4">
          <h2 className="font-black text-white">Create Performance Review</h2>
          {error && <p className="text-sm text-blue-400">{error}</p>}
          
          <label className="block text-sm font-semibold text-zinc-400">Employee</label>
          <select required value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            <option value="">Select employee</option>
            {staff.map((s) => <option key={String(s.id)} value={String(s.id)}>{s.full_name}</option>)}
          </select>

          <label className="block text-sm font-semibold text-zinc-400">Review Type</label>
          <select value={form.review_type} onChange={(e) => setForm({ ...form, review_type: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            {reviewTypes.map((t) => <option key={t}>{t}</option>)}
          </select>

          <label className="block text-sm font-semibold text-zinc-400">Review Period</label>
          <input required type="text" value={form.review_period} onChange={(e) => setForm({ ...form, review_period: e.target.value })} placeholder="e.g., Q1 2024" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Overall Rating</label>
          <select value={form.overall_rating} onChange={(e) => setForm({ ...form, overall_rating: e.target.value })} className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white">
            {ratingScale.map((r) => <option key={r} value={r[0]}>{r}</option>)}
          </select>

          <label className="block text-sm font-semibold text-zinc-400">Goals Achieved</label>
          <textarea rows={3} value={form.goals_achieved} onChange={(e) => setForm({ ...form, goals_achieved: e.target.value })} placeholder="List goals achieved during this period" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Strengths</label>
          <textarea rows={2} value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} placeholder="Key strengths demonstrated" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Areas for Improvement</label>
          <textarea rows={2} value={form.areas_for_improvement} onChange={(e) => setForm({ ...form, areas_for_improvement: e.target.value })} placeholder="Areas requiring development" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Feedback</label>
          <textarea rows={3} value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="Detailed feedback and observations" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <label className="block text-sm font-semibold text-zinc-400">Next Period Goals</label>
          <textarea rows={2} value={form.next_goals} onChange={(e) => setForm({ ...form, next_goals: e.target.value })} placeholder="Goals for the next review period" className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 text-white" />

          <button className="w-full rounded bg-blue-600 py-2 text-white font-bold hover:bg-blue-700">Submit Review</button>
        </form>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-black text-white">Recent Reviews</h2>
          <p className="mt-1 text-sm text-zinc-400">View and manage performance reviews.</p>
          <div className="mt-4 divide-y divide-zinc-800">
            {reviews.length === 0 ? (
              <p className="py-8 text-center text-zinc-500">No performance reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{review.user?.full_name}</p>
                      <p className="text-sm text-zinc-400">{review.review_type} · {review.review_period}</p>
                    </div>
                    <span className="rounded-full bg-blue-900 px-3 py-1 text-xs font-bold text-blue-400">
                      Rating: {review.overall_rating}/5
                    </span>
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
