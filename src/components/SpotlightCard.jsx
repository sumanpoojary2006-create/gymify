import { motion } from "framer-motion";
import ProgressRing from "./ProgressRing";
import { getUserProfile } from "../data/userProfiles";
import {
  calculateStreak,
  countLoggedCalorieDays,
  countTruthyDates,
  getLatestWeight,
  getRecentDateStrings,
  getTotalDays,
} from "../utils/storage";

const MotionArticle = motion.article;

export default function SpotlightCard({ isSelected, onOpenStudio, userData }) {
  const { name, gymDays, weights, calories } = userData;
  const profile = getUserProfile(name);
  const streak = calculateStreak(gymDays);
  const totalGymDays = Object.values(gymDays).filter(Boolean).length;
  const latestWeight = getLatestWeight(weights);
  const progress = Math.min((totalGymDays / getTotalDays()) * 100, 100);
  const weekDates = getRecentDateStrings(7);
  const weeklyWorkouts = countTruthyDates(gymDays, weekDates);
  const nutritionDays = countLoggedCalorieDays(calories, weekDates);

  return (
    <MotionArticle
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-[28px] border shadow-[0_24px_60px_rgba(15,23,42,0.10)] transition ${
        isSelected
          ? "border-slate-900/15 bg-slate-950 text-white dark:border-white/18 dark:bg-slate-900"
          : "border-white/55 bg-white/78 text-slate-950 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
      }`}
    >
      <div className={`relative overflow-hidden bg-gradient-to-br ${profile.gradient} p-5 text-white`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.24),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.18),_transparent_34%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/12 text-3xl backdrop-blur-sm">
              {profile.emoji}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                {profile.title}
              </p>
              <h3 className="mt-1 text-2xl font-semibold">{name}</h3>
            </div>
          </div>
          <ProgressRing
            progress={progress}
            size={64}
            strokeWidth={5}
            colors={profile.ringColors}
            label={`${Math.round(progress)}%`}
          />
        </div>
        <p className="relative mt-4 max-w-[18rem] text-sm leading-6 text-white/84">{profile.goal}</p>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Current streak
            </p>
            <p className="mt-2 text-2xl font-semibold">🔥 {streak}</p>
          </div>
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Latest weight
            </p>
            <p className="mt-2 text-2xl font-semibold">{latestWeight ? `${latestWeight.weight}` : "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-slate-900/4 px-3 py-3 text-center dark:bg-white/5">
            <p className="text-lg font-semibold">{totalGymDays}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              total days
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900/4 px-3 py-3 text-center dark:bg-white/5">
            <p className="text-lg font-semibold">{weeklyWorkouts}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              this week
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900/4 px-3 py-3 text-center dark:bg-white/5">
            <p className="text-lg font-semibold">{nutritionDays}</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              meal days
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300/80 px-4 py-3 dark:border-white/12">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Focus note
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{profile.mantra}</p>
        </div>

        <button
          onClick={onOpenStudio}
          className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            isSelected
              ? "bg-white text-slate-950"
              : "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
          }`}
        >
          Open {name}'s studio
        </button>
      </div>
    </MotionArticle>
  );
}
