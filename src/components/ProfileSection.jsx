import { useState } from "react";
import { calculateBmi, calculateTdee, getLatestWeight } from "../utils/storage";
import { getUserProfile } from "../data/userProfiles";

const activityOptions = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Lightly active" },
  { value: "moderate", label: "Moderately active" },
  { value: "active", label: "Very active" },
  { value: "athlete", label: "Athlete" },
];

function createInitialFormState(userData) {
  return {
    password: userData.auth?.password || "",
    age: userData.bodyProfile?.age || "",
    sex: userData.bodyProfile?.sex || "",
    heightCm: userData.bodyProfile?.heightCm || "",
    activity: userData.bodyProfile?.activity || "moderate",
  };
}

export default function ProfileSection({ userData, onDeleteProfile, onSaveProfile }) {
  const latestWeight = getLatestWeight(userData.weights);
  const profile = getUserProfile(userData.name);
  const [formState, setFormState] = useState(() => createInitialFormState(userData));
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("success");

  const effectiveWeight = latestWeight?.weight || userData.bodyProfile?.weightKg || "";
  const bmiResult = calculateBmi({
    heightCm: formState.heightCm,
    weightKg: effectiveWeight,
  });
  const tdeeResult = calculateTdee({
    activity: formState.activity,
    age: formState.age,
    heightCm: formState.heightCm,
    sex: formState.sex,
    weightKg: effectiveWeight,
  });

  const handleChange = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
    setStatusMessage("");
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!formState.password.trim()) {
      setStatusTone("error");
      setStatusMessage("Password cannot be empty.");
      return;
    }

    if (!formState.age || !formState.heightCm || !formState.sex) {
      setStatusTone("error");
      setStatusMessage("Fill in age, sex, and height before saving.");
      return;
    }

    onSaveProfile({
      ...userData,
      auth: {
        ...userData.auth,
        password: formState.password.trim(),
      },
      bodyProfile: {
        ...userData.bodyProfile,
        age: formState.age,
        sex: formState.sex,
        heightCm: formState.heightCm,
        activity: formState.activity,
        bmi: bmiResult?.bmi || userData.bodyProfile?.bmi || "",
        bmiCategory: bmiResult?.category || userData.bodyProfile?.bmiCategory || "",
      },
    });

    setStatusTone("success");
    setStatusMessage("Profile saved.");
  };

  const handleDelete = () => {
    if (deleteConfirmText.trim() !== userData.name) {
      setStatusTone("error");
      setStatusMessage(`Type ${userData.name} exactly to delete this profile.`);
      return;
    }

    onDeleteProfile(userData.name);
  };

  return (
    <section className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-white/50 bg-white/74 shadow-[0_28px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70">
        <div className={`bg-gradient-to-r ${profile.gradient} p-5 text-white`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur-sm">
                {profile.emoji}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                  Profile
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">{userData.name}</h2>
                <p className="mt-2 text-sm text-white/80">{profile.title}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Current Weight
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
              {effectiveWeight ? `${effectiveWeight} kg` : "Not set"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              BMI
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
              {bmiResult ? bmiResult.bmi : "Not set"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {bmiResult ? bmiResult.category : "Needs height and weight"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              TDEE
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
              {tdeeResult ? `${tdeeResult.tdee}` : "Not set"}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">cal/day</p>
          </div>

          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Activity
            </p>
            <p className="mt-2 text-xl font-semibold capitalize text-slate-950 dark:text-white">
              {formState.activity}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/50 bg-white/74 p-5 shadow-[0_28px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 md:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Account
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">
              Manage your profile
            </h2>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Username
            </label>
            <input
              type="text"
              value={userData.name}
              disabled
              className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={formState.password}
              onChange={(event) => handleChange("password", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Age
            </label>
            <input
              type="number"
              min="0"
              value={formState.age}
              onChange={(event) => handleChange("age", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Sex
            </label>
            <select
              value={formState.sex}
              onChange={(event) => handleChange("sex", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Select sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Height (cm)
            </label>
            <input
              type="number"
              min="0"
              value={formState.heightCm}
              onChange={(event) => handleChange("heightCm", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Activity level
            </label>
            <select
              value={formState.activity}
              onChange={(event) => handleChange("activity", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {activityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {statusMessage && (
            <p
              className={`sm:col-span-2 text-sm font-medium ${
                statusTone === "error" ? "text-rose-600 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {statusMessage}
            </p>
          )}

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-white dark:text-slate-950"
            >
              Save profile
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[30px] border border-rose-300/40 bg-rose-500/8 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-rose-400/20 dark:bg-rose-500/10 md:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-600 dark:text-rose-300">
          Danger Zone
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">
          Delete profile
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          This removes your profile, meal logs, workout history, and saved body details from the shared app.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(event) => setDeleteConfirmText(event.target.value)}
            placeholder={`Type ${userData.name} to confirm`}
            className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-rose-500/30 dark:bg-slate-800 dark:text-white"
          />

          <button
            type="button"
            onClick={handleDelete}
            className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Delete profile
          </button>
        </div>
      </section>
    </section>
  );
}
