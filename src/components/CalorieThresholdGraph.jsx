function formatAxisValue(value) {
  return `${Math.round(value)}`;
}

export default function CalorieThresholdGraph({ current = 0, target = 0 }) {
  if (!target) {
    return (
      <div className="rounded-[24px] border border-slate-900/8 bg-white/72 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
        Save your body details in Health tools once to unlock your daily calorie graph.
      </div>
    );
  }

  const chartMax = Math.max(5000, Math.ceil((target * 2) / 500) * 500);
  const safeCurrent = Math.max(current, 0);
  const safeTarget = Math.max(target, 1);
  const thresholdPercent = Math.min((safeTarget / chartMax) * 100, 100);
  const greenPercent = Math.min((Math.min(safeCurrent, safeTarget) / chartMax) * 100, 100);
  const redPercent =
    safeCurrent > safeTarget
      ? Math.min(((safeCurrent - safeTarget) / chartMax) * 100, 100 - thresholdPercent)
      : 0;

  return (
    <div className="rounded-[24px] border border-slate-900/8 bg-white/76 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Calories intake
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
            {safeCurrent} cal today
          </p>
        </div>
        <span className="rounded-full border border-slate-900/8 bg-slate-900/4 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          target {safeTarget}
        </span>
      </div>

      <div className="mt-5">
        <div className="relative mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span>0</span>
          <span>{formatAxisValue(safeTarget)}</span>
          <span>{formatAxisValue(chartMax)}</span>
        </div>

        <div className="relative h-5 overflow-hidden rounded-md border-2 border-slate-950/65 bg-slate-100 dark:border-white/70 dark:bg-slate-800">
          <div
            className="absolute inset-y-0 left-0 bg-emerald-500"
            style={{ width: `${greenPercent}%` }}
          />
          {redPercent > 0 && (
            <div
              className="absolute inset-y-0 bg-rose-500"
              style={{
                left: `${thresholdPercent}%`,
                width: `${redPercent}%`,
              }}
            />
          )}
          <div
            className="absolute inset-y-0 w-0.5 bg-slate-950/75 dark:bg-white/80"
            style={{ left: `${thresholdPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
