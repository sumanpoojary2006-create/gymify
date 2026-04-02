import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;

const splitOptions = [
  { value: "push", label: "Push" },
  { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" },
  { value: "weight-loss", label: "Weight loss training" },
];

const workoutCountOptions = [4, 5, 6, 7, 8];

export default function WorkoutHelperModal({ open, onClose }) {
  const [split, setSplit] = useState("push");
  const [workoutCount, setWorkoutCount] = useState("5");
  const [plan, setPlan] = useState(null);
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
          workoutCount: Number(workoutCount),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "AI workout helper failed.");
      }

      setPlan(payload);
    } catch (requestError) {
      setPlan(null);
      setError(requestError instanceof Error ? requestError.message : "Could not generate a workout plan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setPlan(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
          onClick={handleClose}
        >
          <MotionDiv
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/50 bg-white/92 shadow-[0_30px_90px_rgba(15,23,42,0.24)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/92"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-900/8 px-5 py-4 dark:border-white/10">
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

            <div className="space-y-5 px-5 py-5">
              <form onSubmit={handleGenerate} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Split</span>
                  <select
                    value={split}
                    onChange={(event) => setSplit(event.target.value)}
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
                    Number of workouts
                  </span>
                  <select
                    value={workoutCount}
                    onChange={(event) => setWorkoutCount(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {workoutCountOptions.map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="self-end rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? "Generating..." : "Get workout"}
                </button>
              </form>

              {error && (
                <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-300">
                  {error}
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

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-900/8 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/60">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Split
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {
                          splitOptions.find((option) => option.value === split)?.label
                        }
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-900/8 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-800/60">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Workouts
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {workoutCount} planned
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

                  <div className="flex justify-end">
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
