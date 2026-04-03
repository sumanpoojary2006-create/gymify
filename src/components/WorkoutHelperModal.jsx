import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;

const splitOptions = [
  { value: "push", label: "Push" },
  { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" },
  { value: "weight-loss", label: "Weight loss training" },
];

const levelOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advance", label: "Advance" },
];

const workoutCountOptions = [4, 5, 6, 7, 8];

function getExerciseTheme(name, split) {
  const lowerName = name.toLowerCase();

  if (
    lowerName.includes("squat") ||
    lowerName.includes("lunge") ||
    lowerName.includes("deadlift") ||
    lowerName.includes("rdl") ||
    lowerName.includes("leg") ||
    lowerName.includes("calf")
  ) {
    return {
      category: "LEGS",
      accent: "#f97316",
      glow: "#fed7aa",
      panel: "#fff7ed",
    };
  }

  if (
    lowerName.includes("row") ||
    lowerName.includes("pull") ||
    lowerName.includes("lat") ||
    lowerName.includes("curl") ||
    lowerName.includes("rear delt") ||
    lowerName.includes("face pull")
  ) {
    return {
      category: "PULL",
      accent: "#0f766e",
      glow: "#99f6e4",
      panel: "#f0fdfa",
    };
  }

  if (
    lowerName.includes("press") ||
    lowerName.includes("chest") ||
    lowerName.includes("push") ||
    lowerName.includes("dip") ||
    lowerName.includes("tricep") ||
    lowerName.includes("shoulder")
  ) {
    return {
      category: "PUSH",
      accent: "#dc2626",
      glow: "#fecaca",
      panel: "#fef2f2",
    };
  }

  if (
    split === "weight-loss" ||
    lowerName.includes("swing") ||
    lowerName.includes("bike") ||
    lowerName.includes("run") ||
    lowerName.includes("rope") ||
    lowerName.includes("burpee") ||
    lowerName.includes("jump")
  ) {
    return {
      category: "CARDIO",
      accent: "#7c3aed",
      glow: "#ddd6fe",
      panel: "#f5f3ff",
    };
  }

  return {
    category: split === "weight-loss" ? "CARDIO" : "GYM",
    accent: "#2563eb",
    glow: "#bfdbfe",
    panel: "#eff6ff",
  };
}

function getPoseSpec(name, split) {
  const lowerName = name.toLowerCase();

  if (
    lowerName.includes("squat") ||
    lowerName.includes("lunge") ||
    lowerName.includes("leg press") ||
    lowerName.includes("leg extension") ||
    lowerName.includes("calf")
  ) {
    return {
      pose: "legs",
      category: "Lower body",
      headline: "Drive through heels",
    };
  }

  if (lowerName.includes("deadlift") || lowerName.includes("rdl")) {
    return {
      pose: "hinge",
      category: "Posterior chain",
      headline: "Hip hinge focus",
    };
  }

  if (
    lowerName.includes("row") ||
    lowerName.includes("pull") ||
    lowerName.includes("lat") ||
    lowerName.includes("curl") ||
    lowerName.includes("rear delt") ||
    lowerName.includes("face pull")
  ) {
    return {
      pose: "pull",
      category: "Back + biceps",
      headline: "Pull with elbows",
    };
  }

  if (
    lowerName.includes("press") ||
    lowerName.includes("push") ||
    lowerName.includes("dip") ||
    lowerName.includes("tricep") ||
    lowerName.includes("shoulder") ||
    lowerName.includes("chest")
  ) {
    return {
      pose: "push",
      category: "Chest + shoulders",
      headline: "Press with control",
    };
  }

  if (
    split === "weight-loss" ||
    lowerName.includes("swing") ||
    lowerName.includes("bike") ||
    lowerName.includes("run") ||
    lowerName.includes("rope") ||
    lowerName.includes("burpee") ||
    lowerName.includes("jump")
  ) {
    return {
      pose: "cardio",
      category: "Conditioning",
      headline: "Keep moving",
    };
  }

  return {
    pose: "neutral",
    category: split === "weight-loss" ? "Conditioning" : "Gym work",
    headline: "Smooth tempo",
  };
}

function getHumanPoseMarkup(pose, accent) {
  const shared = `stroke="${accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const skin = "#f8d4bd";
  const shorts = "#0f172a";

  if (pose === "push") {
    return `
      <circle cx="80" cy="46" r="12" fill="${skin}" />
      <path d="M80 58 L80 92" ${shared} />
      <path d="M80 66 L56 50" ${shared} />
      <path d="M56 50 L42 32" ${shared} />
      <path d="M80 66 L104 50" ${shared} />
      <path d="M104 50 L118 32" ${shared} />
      <path d="M74 90 L66 122" ${shared} />
      <path d="M86 90 L94 122" ${shared} />
      <circle cx="38" cy="28" r="8" fill="${accent}" />
      <circle cx="122" cy="28" r="8" fill="${accent}" />
      <rect x="68" y="74" width="24" height="18" rx="8" fill="${shorts}" />
    `;
  }

  if (pose === "pull") {
    return `
      <circle cx="86" cy="48" r="12" fill="${skin}" />
      <path d="M86 60 L76 92" ${shared} />
      <path d="M76 70 L48 78" ${shared} />
      <path d="M48 78 L36 72" ${shared} />
      <path d="M76 74 L102 78" ${shared} />
      <path d="M102 78 L118 72" ${shared} />
      <path d="M76 92 L66 124" ${shared} />
      <path d="M76 92 L96 122" ${shared} />
      <rect x="66" y="74" width="22" height="18" rx="8" fill="${shorts}" />
      <rect x="28" y="68" width="96" height="8" rx="4" fill="${accent}" fill-opacity="0.22" />
    `;
  }

  if (pose === "legs") {
    return `
      <circle cx="80" cy="46" r="12" fill="${skin}" />
      <path d="M80 58 L80 88" ${shared} />
      <path d="M80 68 L52 70" ${shared} />
      <path d="M80 68 L108 70" ${shared} />
      <path d="M80 88 L58 106" ${shared} />
      <path d="M58 106 L48 128" ${shared} />
      <path d="M80 88 L102 106" ${shared} />
      <path d="M102 106 L112 128" ${shared} />
      <rect x="68" y="72" width="24" height="18" rx="8" fill="${shorts}" />
    `;
  }

  if (pose === "hinge") {
    return `
      <circle cx="92" cy="46" r="12" fill="${skin}" />
      <path d="M92 58 L74 88" ${shared} />
      <path d="M78 72 L54 86" ${shared} />
      <path d="M78 72 L102 86" ${shared} />
      <path d="M74 88 L66 124" ${shared} />
      <path d="M74 88 L98 122" ${shared} />
      <rect x="64" y="72" width="22" height="18" rx="8" fill="${shorts}" />
      <rect x="44" y="86" width="68" height="8" rx="4" fill="${accent}" />
      <circle cx="40" cy="90" r="8" fill="${accent}" />
      <circle cx="116" cy="90" r="8" fill="${accent}" />
    `;
  }

  if (pose === "cardio") {
    return `
      <circle cx="78" cy="46" r="12" fill="${skin}" />
      <path d="M78 58 L80 88" ${shared} />
      <path d="M78 68 L56 58" ${shared} />
      <path d="M78 68 L98 52" ${shared} />
      <path d="M80 88 L62 102" ${shared} />
      <path d="M62 102 L48 126" ${shared} />
      <path d="M80 88 L98 100" ${shared} />
      <path d="M98 100 L116 92" ${shared} />
      <rect x="68" y="72" width="24" height="18" rx="8" fill="${shorts}" />
      <path d="M28 122 C48 108 60 116 74 110" stroke="${accent}" stroke-width="4" stroke-linecap="round" opacity="0.35" />
    `;
  }

  return `
    <circle cx="80" cy="46" r="12" fill="${skin}" />
    <path d="M80 58 L80 92" ${shared} />
    <path d="M80 66 L56 74" ${shared} />
    <path d="M80 66 L104 74" ${shared} />
    <path d="M80 92 L66 124" ${shared} />
    <path d="M80 92 L94 124" ${shared} />
    <rect x="68" y="74" width="24" height="18" rx="8" fill="${shorts}" />
  `;
}

function getExerciseImageDataUrl(name, split) {
  const theme = getExerciseTheme(name, split);
  const spec = getPoseSpec(name, split);
  const title = name.length > 24 ? `${name.slice(0, 24)}...` : name;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none">
      <defs>
        <linearGradient id="bg" x1="18" y1="12" x2="142" y2="150" gradientUnits="userSpaceOnUse">
          <stop stop-color="${theme.glow}" />
          <stop offset="1" stop-color="${theme.panel}" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="28" fill="url(#bg)" />
      <circle cx="122" cy="34" r="22" fill="${theme.accent}" fill-opacity="0.12" />
      <circle cx="34" cy="130" r="28" fill="${theme.accent}" fill-opacity="0.1" />
      <rect x="16" y="108" width="128" height="34" rx="16" fill="#ffffff" fill-opacity="0.82" />
      <text x="18" y="28" fill="${theme.accent}" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.6">${spec.category.toUpperCase()}</text>
      ${getHumanPoseMarkup(spec.pose, theme.accent)}
      <text x="18" y="124" fill="#0f172a" font-family="Arial, sans-serif" font-size="14" font-weight="700">${title}</text>
      <text x="18" y="142" fill="#475569" font-family="Arial, sans-serif" font-size="11">${spec.headline}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function WorkoutHelperModal({ open, onClose }) {
  const [split, setSplit] = useState("push");
  const [level, setLevel] = useState("beginner");
  const [workoutCount, setWorkoutCount] = useState("5");
  const [plan, setPlan] = useState(null);
  const [generatedFor, setGeneratedFor] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/workout-help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          split,
          level,
          workoutCount: Number(workoutCount),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "AI workout helper failed.");
      }

      setPlan(payload);
      setGeneratedFor({
        split,
        level,
        workoutCount,
      });
    } catch (requestError) {
      setPlan(null);
      setGeneratedFor(null);
      setError(requestError instanceof Error ? requestError.message : "Could not generate a workout plan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setPlan(null);
    setGeneratedFor(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 px-4 py-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <MotionDiv
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mx-auto flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] border border-white/50 bg-white/92 shadow-[0_30px_90px_rgba(15,23,42,0.24)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/92"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-900/8 bg-white/95 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  AI Workout Help
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">
                  Build today&apos;s session
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Pick the split and how many workouts you want, and Gemini will suggest a detailed plan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 space-y-5 overflow-y-auto px-5 py-5">
              <form onSubmit={handleGenerate} className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Split</span>
                  <select
                    value={split}
                    onChange={(event) => {
                      setSplit(event.target.value);
                      setPlan(null);
                      setGeneratedFor(null);
                      setError("");
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {splitOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Hardness level
                  </span>
                  <select
                    value={level}
                    onChange={(event) => {
                      setLevel(event.target.value);
                      setPlan(null);
                      setGeneratedFor(null);
                      setError("");
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {levelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Number of workouts
                  </span>
                  <select
                    value={workoutCount}
                    onChange={(event) => {
                      setWorkoutCount(event.target.value);
                      setPlan(null);
                      setGeneratedFor(null);
                      setError("");
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {workoutCountOptions.map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </label>

              </form>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? "Generating..." : "Get workout"}
              </button>

              {error && (
                <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300">
                  {error}
                </div>
              )}

              {!plan && !error && (
                <div className="rounded-2xl border border-slate-900/8 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  Pick a category, choose how many workouts you want, then tap <span className="font-semibold">Get workout</span>.
                </div>
              )}

              {plan && (
                <div className="space-y-4 rounded-[26px] border border-slate-900/8 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Suggested workout
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                        {plan.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {plan.overview}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-900/8 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                      {plan.focus}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-900/8 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/60">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Split
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {
                          splitOptions.find((option) => option.value === (generatedFor?.split || split))?.label
                        }
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-900/8 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/60">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Level
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {levelOptions.find((option) => option.value === (generatedFor?.level || level))?.label}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-900/8 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/60">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Workouts
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {generatedFor?.workoutCount || workoutCount} planned
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-900/8 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/60">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Goal
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {plan.focus}
                      </p>
                    </div>
                  </div>

                  {Array.isArray(plan.warmup) && plan.warmup.length > 0 && (
                    <div className="rounded-2xl border border-slate-900/8 bg-white px-4 py-4 dark:border-white/10 dark:bg-slate-800/60">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Warm-up
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {plan.warmup.map((item) => (
                          <span
                            key={item}
                            className="rounded-full bg-slate-900/6 px-3 py-1.5 text-sm text-slate-700 dark:bg-white/10 dark:text-slate-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Workout plan
                    </p>
                    {plan.exercises.map((exercise, index) => (
                      <div
                        key={`${exercise.name}-${index}`}
                        className="rounded-[22px] border border-slate-900/8 bg-white/75 px-4 py-4 dark:border-white/10 dark:bg-white/6"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
                            {index + 1}
                          </span>
                          <img
                            src={getExerciseImageDataUrl(
                              exercise.name,
                              generatedFor?.split || split
                            )}
                            alt={`${exercise.name} workout visual`}
                            className="h-20 w-20 shrink-0 rounded-2xl border border-slate-900/8 object-cover shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-white/10"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {exercise.name}
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  {exercise.notes}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs sm:min-w-[180px]">
                                <span className="rounded-full bg-slate-900/6 px-3 py-1.5 text-center font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                                  {exercise.sets} x {exercise.reps}
                                </span>
                                <span className="rounded-full bg-slate-900/6 px-3 py-1.5 text-center font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                                  Rest {exercise.rest}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {plan.finisher && (
                    <div className="rounded-2xl border border-orange-300/40 bg-orange-500/10 px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
                        Finisher
                      </p>
                      <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{plan.finisher}</p>
                    </div>
                  )}

                  {Array.isArray(plan.coachNotes) && plan.coachNotes.length > 0 && (
                    <div className="rounded-2xl border border-slate-900/8 bg-white px-4 py-4 dark:border-white/10 dark:bg-slate-800/60">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Coach notes
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
                        {plan.coachNotes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="sticky bottom-0 flex justify-end border-t border-slate-900/8 bg-slate-50/95 pt-4 backdrop-blur dark:border-white/10 dark:bg-slate-900/95">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-2xl border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Close to home
                    </button>
                  </div>
                </div>
              )}
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
