import { useState } from "react";
import { calculateTdee } from "../utils/storage";

const activityOptions = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Lightly active" },
  { value: "moderate", label: "Moderately active" },
  { value: "active", label: "Very active" },
  { value: "athlete", label: "Athlete" },
];

function getDeficitSummary(tdee, intake) {
  const difference = Math.round(intake - tdee);

  if (difference < 0) {
    return {
      label: `Deficit of ${Math.abs(difference)} cal`,
      tone: "text-emerald-700 dark:text-emerald-400",
      chip: "border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  }

  if (difference > 0) {
    return {
      label: `Surplus of ${difference} cal`,
      tone: "text-rose-700 dark:text-rose-400",
      chip: "border-rose-300/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    };
  }

  return {
    label: "Right at maintenance",
    tone: "text-slate-700 dark:text-slate-300",
    chip: "border-slate-300/40 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  };
}

export default function TdeeCalculator({
  bodyProfile,
  latestWeight,
  todayCalories,
  onSaveBodyProfile,
}) {
  const [formState, setFormState] = useState(() => ({
    age: bodyProfile.age || "",
    heightCm: bodyProfile.heightCm || "",
    weightKg: bodyProfile.weightKg || "",
    sex: bodyProfile.sex || "",
    activity: bodyProfile.activity || "moderate",
  }));

  const effectiveWeight = latestWeight?.weight || formState.weightKg;
  const result = calculateTdee({
    ...formState,
    weightKg: effectiveWeight,
  });
  const deficitSummary = result ? getDeficitSummary(result.tdee, todayCalories) : null;

  return (
    <div className="soft-panel rounded-[24px] p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-base font-semibold text-slate-950 dark:text-white">
            TDEE calculator
          </h4>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Estimate maintenance calories and check whether today is a deficit or surplus.
          </p>
        </div>
        <span className="rounded-full border border-slate-900/8 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          {latestWeight ? `Using ${latestWeight.weight} kg` : "Add weight or enter below"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="number"
          min="0"
          placeholder="Age"
          value={formState.age}
          onChange={(event) => setFormState((current) => ({ ...current, age: event.target.value }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <input
          type="number"
          min="0"
          placeholder="Height (cm)"
          value={formState.heightCm}
          onChange={(event) =>
            setFormState((current) => ({ ...current, heightCm: event.target.value }))
          }
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <input
          type="number"
          min="0"
          step="0.1"
          placeholder={latestWeight ? "Manual weight override (optional)" : "Weight (kg)"}
          value={formState.weightKg}
          onChange={(event) =>
            setFormState((current) => ({ ...current, weightKg: event.target.value }))
          }
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <select
          value={formState.sex}
          onChange={(event) => setFormState((current) => ({ ...current, sex: event.target.value }))}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="">Sex</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select
          value={formState.activity}
          onChange={(event) =>
            setFormState((current) => ({ ...current, activity: event.target.value }))
          }
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white sm:col-span-2"
        >
          {activityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onSaveBodyProfile(formState)}
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-white dark:text-slate-950"
        >
          Save TDEE details
        </button>
      </div>

      {result ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-4 text-center dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              BMR
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{result.bmr}</p>
          </div>
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-4 text-center dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              TDEE
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{result.tdee}</p>
          </div>
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-4 text-center dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Intake today
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{todayCalories}</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Add age, height, sex, and weight to calculate maintenance calories.
        </p>
      )}

      {deficitSummary && (
        <div className="mt-4 rounded-2xl border border-slate-900/8 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={`text-sm font-semibold ${deficitSummary.tone}`}>{deficitSummary.label}</p>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${deficitSummary.chip}`}>
              Goal check
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Based on today’s logged calories versus estimated maintenance. This is a helpful daily
            estimate, not a medical diagnosis.
          </p>
        </div>
      )}
    </div>
  );
}
