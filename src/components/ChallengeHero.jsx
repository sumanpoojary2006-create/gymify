import { motion } from "framer-motion";
import ProgressRing from "./ProgressRing";
import {
  calculateStreak,
  getCurrentDayNumber,
  getTodayStr,
  getTotalDays,
} from "../utils/storage";
import { getUserProfile } from "../data/userProfiles";

const MotionSection = motion.section;
const MotionDiv = motion.div;

export default function ChallengeHero({ data, cloudSyncEnabled }) {
  const users = Object.values(data);
  const totalDays = getTotalDays();
  const dayNumber = Math.min(Math.max(getCurrentDayNumber(), 1), totalDays);
  const today = getTodayStr();

  const totalGymDays = users.reduce(
    (sum, user) => sum + Object.values(user.gymDays).filter(Boolean).length,
    0
  );
  const averageStreak = users.length
    ? Math.round(
        users.reduce((sum, user) => sum + calculateStreak(user.gymDays), 0) / users.length
      )
    : 0;
  const checkedInToday = users.filter((user) => user.gymDays[today]).length;
  const calorieLogsToday = users.filter((user) => (user.calories[today] || []).length > 0).length;

  const leader = [...users].sort((first, second) => {
    const secondGymDays = Object.values(second.gymDays).filter(Boolean).length;
    const firstGymDays = Object.values(first.gymDays).filter(Boolean).length;
    if (secondGymDays !== firstGymDays) return secondGymDays - firstGymDays;
    return calculateStreak(second.gymDays) - calculateStreak(first.gymDays);
  })[0];

  const leaderProfile = leader ? getUserProfile(leader.name) : null;
  const teamCompletion = users.length ? (totalGymDays / (totalDays * users.length)) * 100 : 0;

  const statCards = [
    {
      label: "Team sessions",
      value: totalGymDays,
      detail: "Total gym check-ins logged",
    },
    {
      label: "Average streak",
      value: `${averageStreak} days`,
      detail: "Momentum across the crew",
    },
    {
      label: "Today on fire",
      value: `${checkedInToday}/${users.length}`,
      detail: "Members who checked in today",
    },
    {
      label: "Meals logged",
      value: calorieLogsToday,
      detail: "Nutrition entries added today",
    },
  ];

  return (
    <MotionSection
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[32px] border border-white/50 bg-white/70 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 md:p-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.72),rgba(255,255,255,0.28))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.84),rgba(15,23,42,0.52))]" />
      <div className="absolute -left-8 top-16 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-sky-400/20 blur-3xl" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/8 bg-slate-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              60 Day Lean Challenge
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {cloudSyncEnabled ? "Shared cloud sync live" : "Local mode"}
            </span>
          </div>

          <div className="max-w-2xl space-y-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-5xl">
              Build streaks together. Make every check-in feel like a win.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
              Track gym days, calories, and weight in one shared board your crew can open on any
              phone. The goal is simple: visible progress, playful competition, and more reasons
              to show up tomorrow.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card, index) => (
              <MotionDiv
                key={card.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index }}
                className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-lg dark:border-white/10 dark:bg-slate-950/35"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
                  {card.value}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.detail}</p>
              </MotionDiv>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[28px] border border-slate-900/8 bg-slate-950 px-5 py-5 text-white shadow-[0_25px_70px_rgba(15,23,42,0.32)] dark:border-white/10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Challenge pulse
                </p>
                <p className="mt-3 text-3xl font-semibold">Day {dayNumber}</p>
                <p className="mt-2 max-w-[16rem] text-sm leading-6 text-slate-300">
                  You are {Math.round((dayNumber / totalDays) * 100)}% through the challenge with
                  {` ${totalDays - dayNumber}`} days left to keep the pressure on.
                </p>
              </div>
              <ProgressRing
                progress={teamCompletion}
                size={92}
                strokeWidth={8}
                colors={["#f59e0b", "#38bdf8"]}
                label={`${Math.round(teamCompletion)}%`}
              />
            </div>
          </div>

          {leader && leaderProfile && (
            <div
              className={`overflow-hidden rounded-[28px] border ${leaderProfile.border} bg-gradient-to-br ${leaderProfile.gradient} p-5 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                    Current leader
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white/16 text-3xl backdrop-blur-sm">
                      {leaderProfile.emoji}
                    </div>
                    <div>
                      <p className="text-xl font-semibold">{leader.name}</p>
                      <p className={`text-sm ${leaderProfile.accentText}`}>{leaderProfile.title}</p>
                    </div>
                  </div>
                </div>
                <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1 text-xs font-semibold">
                  🔥 {calculateStreak(leader.gymDays)} day streak
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/84">{leaderProfile.mantra}</p>
            </div>
          )}
        </div>
      </div>
    </MotionSection>
  );
}
