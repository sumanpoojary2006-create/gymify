import { motion } from "framer-motion";
import { getCurrentDayNumber, getTodayStr, getTotalDays } from "../utils/storage";

const MotionSection = motion.section;

export default function ChallengeHero({ cloudSyncEnabled, data }) {
  const totalDays = getTotalDays();
  const dayNumber = Math.min(Math.max(getCurrentDayNumber(), 1), totalDays);
  const today = getTodayStr();
  const users = Object.values(data);
  const checkedInToday = users.filter((user) => user.gymDays[today]).length;

  return (
    <MotionSection
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[30px] border border-white/55 bg-white/78 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/68 md:p-7"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-slate-900/8 bg-slate-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              Crew overview
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                cloudSyncEnabled
                  ? "border border-emerald-500/18 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border border-amber-500/18 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              }`}
            >
              {cloudSyncEnabled ? "Shared cloud sync live" : "Local mode"}
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
            Three people. One shared challenge. Clear progress at a glance.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
            Start here with the main crew cards, then open the studio tab when you want the full
            workout, nutrition, and leaderboard details.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:w-auto">
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Today
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {checkedInToday}/{users.length}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">checked in</p>
          </div>
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Challenge day
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{dayNumber}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">of {totalDays}</p>
          </div>
        </div>
      </div>
    </MotionSection>
  );
}
