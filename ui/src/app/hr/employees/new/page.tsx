"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ROLES = [
  "ADMIN",
  "MANAGER",
  "CASHIER",
  "WAITER",
  "CHEF",
  "STOREKEEPER",
  "BARMAN",
  "DISPATCHER",
  "ACCOUNTANT",
  "HR",
];

const EMPLOYMENT_TYPES = ["PERMANENT", "CONTRACT", "PART_TIME", "CASUAL", "PROBATION"];
const EMPLOYMENT_STATUSES = ["ACTIVE", "INACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const EDUCATION_LEVELS = [
  "Primary",
  "Secondary",
  "Certificate",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Other",
];

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Basic Info
  full_name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  // Personal
  date_of_birth: string;
  gender: string;
  nationality: string;
  national_id: string;
  tax_id: string;
  passport_number: string;
  physical_address: string;
  postal_address: string;
  city: string;
  country: string;
  personal_email: string;
  alternative_phone: string;
  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  // Employment
  employment_start_date: string;
  employment_end_date: string;
  employment_type: string;
  employment_status: string;
  probation_end_date: string;
  contract_end_date: string;
  department: string;
  position_title: string;
  // Banking
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_branch: string;
  bank_swift_code: string;
  // Qualifications
  education_level: string;
  certifications: string;
  skills: string;
  notes: string;
}

const initialForm: FormData = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  role: "WAITER",
  date_of_birth: "",
  gender: "",
  nationality: "",
  national_id: "",
  tax_id: "",
  passport_number: "",
  physical_address: "",
  postal_address: "",
  city: "",
  country: "Kenya",
  personal_email: "",
  alternative_phone: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
  employment_start_date: new Date().toISOString().split("T")[0],
  employment_end_date: "",
  employment_type: "PERMANENT",
  employment_status: "ACTIVE",
  probation_end_date: "",
  contract_end_date: "",
  department: "",
  position_title: "",
  bank_name: "",
  bank_account_number: "",
  bank_account_name: "",
  bank_branch: "",
  bank_swift_code: "",
  education_level: "",
  certifications: "",
  skills: "",
  notes: "",
};

const STEPS = [
  { id: 1, title: "Basic Info", icon: "person", description: "Account & personal details" },
  { id: 2, title: "Employment", icon: "briefcase", description: "Role & job information" },
  { id: 3, title: "Emergency", icon: "siren", description: "Emergency contact" },
  { id: 4, title: "Banking", icon: "bank", description: "Bank & qualifications" },
];

export default function NewEmployeePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const set = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, string> = {};
      for (const [k, v] of Object.entries(form)) {
        if (v !== "") payload[k] = v;
      }

      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:3001";
      const res = await fetch(`${apiBaseUrl}/hrm/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Failed to create employee (${res.status})`);
      }

      router.push("/hr?success=employee-created");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return form.full_name.length >= 2 && form.password.length >= 8 && form.role;
    }
    if (step === 2) {
      return form.employment_start_date !== "";
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/hr"
              className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              ← HR Dashboard
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-white text-sm font-medium">Add New Employee</span>
          </div>
          <span className="text-slate-400 text-sm">Step {step} of 4</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">New Employee Onboarding</h1>
          <p className="text-slate-400">Fill in the details to create a new staff account</p>
        </div>

        {/* Step progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute inset-x-0 top-5 h-0.5 bg-white/10" />
            <div
              className="absolute top-5 h-0.5 bg-gradient-to-r from-emerald-500 to-red-500 transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
            {STEPS.map((s) => (
              <div key={s.id} className="relative flex flex-col items-center gap-2 z-10">
                <button
                  onClick={() => s.id < step && setStep(s.id as Step)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300 ${
                    s.id < step
                      ? "bg-emerald-500 border-emerald-500 cursor-pointer"
                      : s.id === step
                      ? "bg-slate-800 border-red-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                      : "bg-slate-800 border-white/20 cursor-not-allowed"
                  }`}
                >
                  {s.id < step ? "Done" : s.icon}
                </button>
                <div className="text-center hidden sm:block">
                  <p
                    className={`text-xs font-semibold ${
                      s.id === step ? "text-zinc-400" : s.id < step ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="text-xs text-slate-600">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
              <span className="text-red-400 text-xl">Error</span>
              <div>
                <p className="text-red-300 font-semibold text-sm">Failed to create employee</p>
                <p className="text-red-400 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* STEP 1 — Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Person</span> Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={form.full_name}
                    onChange={(v) => set("full_name", v)}
                    placeholder="e.g. John Kamau"
                  />
                </div>

                <div>
                  <Label>Work Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    placeholder="john@meatlovers.co.ke"
                  />
                </div>

                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                    placeholder="+254712345678"
                  />
                </div>

                <div>
                  <Label>System Role *</Label>
                  <Select value={form.role} onChange={(v) => set("role", v)} options={ROLES} />
                </div>

                <div>
                  <Label>Temporary Password * (min 8 chars)</Label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30 transition-all pr-12"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(v) => set("date_of_birth", v)}
                  />
                </div>

                <div>
                  <Label>Gender</Label>
                  <Select
                    value={form.gender}
                    onChange={(v) => set("gender", v)}
                    options={GENDERS}
                    placeholder="Select gender"
                  />
                </div>

                <div>
                  <Label>Nationality</Label>
                  <Input
                    value={form.nationality}
                    onChange={(v) => set("nationality", v)}
                    placeholder="e.g. Kenyan"
                  />
                </div>

                <div>
                  <Label>National ID</Label>
                  <Input
                    value={form.national_id}
                    onChange={(v) => set("national_id", v)}
                    placeholder="ID number"
                  />
                </div>

                <div>
                  <Label>KRA PIN / Tax ID</Label>
                  <Input
                    value={form.tax_id}
                    onChange={(v) => set("tax_id", v)}
                    placeholder="e.g. A012345678M"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Physical Address</Label>
                  <Input
                    value={form.physical_address}
                    onChange={(v) => set("physical_address", v)}
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(v) => set("city", v)}
                    placeholder="e.g. Nairobi"
                  />
                </div>

                <div>
                  <Label>Country</Label>
                  <Input
                    value={form.country}
                    onChange={(v) => set("country", v)}
                    placeholder="e.g. Kenya"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Employment */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Briefcase</span> Employment Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input
                    value={form.department}
                    onChange={(v) => set("department", v)}
                    placeholder="e.g. Kitchen, Bar, Front Office"
                  />
                </div>

                <div>
                  <Label>Position / Job Title</Label>
                  <Input
                    value={form.position_title}
                    onChange={(v) => set("position_title", v)}
                    placeholder="e.g. Senior Chef"
                  />
                </div>

                <div>
                  <Label>Employment Type</Label>
                  <Select
                    value={form.employment_type}
                    onChange={(v) => set("employment_type", v)}
                    options={EMPLOYMENT_TYPES}
                  />
                </div>

                <div>
                  <Label>Employment Status</Label>
                  <Select
                    value={form.employment_status}
                    onChange={(v) => set("employment_status", v)}
                    options={EMPLOYMENT_STATUSES}
                  />
                </div>

                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={form.employment_start_date}
                    onChange={(v) => set("employment_start_date", v)}
                  />
                </div>

                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={form.employment_end_date}
                    onChange={(v) => set("employment_end_date", v)}
                  />
                </div>

                {form.employment_type === "PROBATION" && (
                  <div>
                    <Label>Probation End Date</Label>
                    <Input
                      type="date"
                      value={form.probation_end_date}
                      onChange={(v) => set("probation_end_date", v)}
                    />
                  </div>
                )}

                {form.employment_type === "CONTRACT" && (
                  <div>
                    <Label>Contract End Date</Label>
                    <Input
                      type="date"
                      value={form.contract_end_date}
                      onChange={(v) => set("contract_end_date", v)}
                    />
                  </div>
                )}

                <div>
                  <Label>Education Level</Label>
                  <Select
                    value={form.education_level}
                    onChange={(v) => set("education_level", v)}
                    options={EDUCATION_LEVELS}
                    placeholder="Select level"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Skills</Label>
                  <textarea
                    value={form.skills}
                    onChange={(e) => set("skills", e.target.value)}
                    rows={2}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30 transition-all resize-none"
                    placeholder="e.g. Customer service, Inventory management, Barista"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Certifications</Label>
                  <textarea
                    value={form.certifications}
                    onChange={(e) => set("certifications", e.target.value)}
                    rows={2}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30 transition-all resize-none"
                    placeholder="e.g. Food Handler Certificate, First Aid"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    rows={3}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30 transition-all resize-none"
                    placeholder="Any additional notes about this employee..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Emergency Contact */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Alert</span> Emergency Contact
              </h2>
              <p className="text-slate-400 text-sm">
                This information will be used in case of emergency. It is optional but highly
                recommended.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Contact Full Name</Label>
                  <Input
                    value={form.emergency_contact_name}
                    onChange={(v) => set("emergency_contact_name", v)}
                    placeholder="e.g. Jane Kamau"
                  />
                </div>

                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    type="tel"
                    value={form.emergency_contact_phone}
                    onChange={(v) => set("emergency_contact_phone", v)}
                    placeholder="+254712345678"
                  />
                </div>

                <div>
                  <Label>Relationship</Label>
                  <Input
                    value={form.emergency_contact_relationship}
                    onChange={(v) => set("emergency_contact_relationship", v)}
                    placeholder="e.g. Spouse, Parent, Sibling"
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-amber-300 text-sm font-semibold mb-1">Review before next step</p>
                <div className="text-slate-400 text-sm space-y-1">
                  <p>
                    <span className="text-slate-300 font-medium">Name:</span> {form.full_name}
                  </p>
                  <p>
                    <span className="text-slate-300 font-medium">Role:</span> {form.role}
                  </p>
                  <p>
                    <span className="text-slate-300 font-medium">Department:</span>{" "}
                    {form.department || "—"}
                  </p>
                  <p>
                    <span className="text-slate-300 font-medium">Employment Type:</span>{" "}
                    {form.employment_type}
                  </p>
                  <p>
                    <span className="text-slate-300 font-medium">Start Date:</span>{" "}
                    {form.employment_start_date}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Banking */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Bank</span> Banking Details
              </h2>
              <p className="text-slate-400 text-sm">
                Banking information is required for payroll processing. All fields are optional at
                this stage.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={form.bank_name}
                    onChange={(v) => set("bank_name", v)}
                    placeholder="e.g. Equity Bank"
                  />
                </div>

                <div>
                  <Label>Account Number</Label>
                  <Input
                    value={form.bank_account_number}
                    onChange={(v) => set("bank_account_number", v)}
                    placeholder="Account number"
                  />
                </div>

                <div>
                  <Label>Account Name</Label>
                  <Input
                    value={form.bank_account_name}
                    onChange={(v) => set("bank_account_name", v)}
                    placeholder="Name on bank account"
                  />
                </div>

                <div>
                  <Label>Branch</Label>
                  <Input
                    value={form.bank_branch}
                    onChange={(v) => set("bank_branch", v)}
                    placeholder="e.g. Westlands"
                  />
                </div>

                <div>
                  <Label>SWIFT Code</Label>
                  <Input
                    value={form.bank_swift_code}
                    onChange={(v) => set("bank_swift_code", v)}
                    placeholder="e.g. EQBLKENA"
                  />
                </div>
              </div>

              {/* Final summary */}
              <div className="mt-6 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-emerald-300 font-semibold mb-3">Ready to create employee</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Full Name", form.full_name],
                    ["Role", form.role],
                    ["Phone", form.phone || "—"],
                    ["Email", form.email || "—"],
                    ["Department", form.department || "—"],
                    ["Position", form.position_title || "—"],
                    ["Employment Type", form.employment_type],
                    ["Start Date", form.employment_start_date],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span className="text-slate-400">{label}: </span>
                      <span className="text-white font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => step > 1 && setStep((step - 1) as Step)}
            disabled={step === 1}
            className="px-6 py-3 rounded-xl border border-white/20 text-slate-300 hover:text-white hover:border-white/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <div className="flex gap-3">
            <Link
              href="/hr"
              className="px-6 py-3 rounded-xl border border-white/20 text-slate-300 hover:text-white hover:border-white/40 transition-all"
            >
              Cancel
            </Link>

            {step < 4 ? (
              <button
                onClick={() => setStep((step + 1) as Step)}
                disabled={!canProceed()}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-500 to-emerald-500 text-white font-semibold hover:from-red-400 hover:to-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/25"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Employee"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Reusable input components ----

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-300 mb-1.5">{children}</label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30 transition-all"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30 transition-all"
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
