import { useState } from "react";
import { calculateBmi, getFatLossTargetMetrics } from "../utils/storage";

const activityOptions = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Lightly active" },
  { value: "moderate", label: "Moderately active" },
  { value: "active", label: "Very active" },
  { value: "athlete", label: "Athlete" },
];

function getDeficitSummary(metrics) {
  const difference = Math.round(metrics.intake - metrics.targetIntake);

  if (difference < 0) {
    return {
      label: `${Math.abs(difference)} cal below your fat-loss cap`,
      tone: "text-emerald-700 dark:text-emerald-400",
      chip: "border-emerald-300/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  }

  if (difference > 0) {
    return {
      label: `${difference} cal over today's cap`,
      tone: "text-rose-700 dark:text-rose-400",
      chip: "border-rose-300/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    };
  }

  return {
    label: "Right on your fat-loss target",
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
  const bmiResult = calculateBmi({
    heightCm: formState.heightCm,
    weightKg: effectiveWeight,
  });
  const result = getFatLossTargetMetrics({
    ...formState,
    weightKg: effectiveWeight,
    intake: todayCalories,
  });
  const deficitSummary = result ? getDeficitSummary(result) : null;

  return (
    <div className="soft-panel rounded-[24px] p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h4 className="font-display text-base font-semibold text-slate-950 dark:text-white">
            TDEE calculator
          </h4>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Save these details once. After that, the calculator updates itself using the latest
            daily weight you log.
          </p>
        </div>
        <span className="rounded-full border border-slate-900/8 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          {latestWeight ? `Using latest weight: ${latestWeight.weight} kg` : "Using saved fallback weight"}
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
          placeholder="Fallback weight (kg)"
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
          Save details
        </button>
      </div>

      {result ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-4 text-center dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Maintenance
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{result.tdee}</p>
          </div>
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-4 text-center dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Daily cap
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{result.targetIntake}</p>
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
          Add age, height, sex, and a fallback weight once. Later daily weight entries will drive
          the calculator automatically.
        </p>
      )}

      {bmiResult && (
        <div className="mt-4 rounded-2xl border border-slate-900/8 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                BMI
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                {bmiResult.bmi}
              </p>
            </div>
            <span className="rounded-full border border-sky-300/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
              {bmiResult.category}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Saved with your profile and refreshed when a new daily weight is logged.
          </p>
        </div>
      )}

      {deficitSummary && (
        <div className="mt-4 rounded-2xl border border-slate-900/8 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={`text-sm font-semibold ${deficitSummary.tone}`}>{deficitSummary.label}</p>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${deficitSummary.chip}`}>
              1 kg / week pace
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            This uses your saved profile plus latest weight to build a daily calorie cap for a
            roughly 1 kg per week fat-loss pace. It&apos;s a practical guide, not medical advice.
          </p>
          {result.floorAdjusted && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Your target was held above a basic safety floor, so the full 1 kg/week cut is softened here.
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Maintenance: {result.tdee} cal. Suggested deficit: {result.effectiveDeficitGoal} cal.
          </p>
        </div>
      )}
    </div>
  );
}
