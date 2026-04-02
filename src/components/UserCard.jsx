import { useState } from "react";
import { motion } from "framer-motion";
import GymCalendar from "./GymCalendar";
import WeightChart from "./WeightChart";
import CalorieChart from "./CalorieChart";
import BadgeDisplay from "./BadgeDisplay";
import ProgressRing from "./ProgressRing";
import { estimateCalories } from "../data/calorieDatabase";
import { getUserProfile } from "../data/userProfiles";
import {
  calculateStreak,
  countLoggedCalorieDays,
  countTruthyDates,
  getTodayCalories,
  getLatestWeight,
  getRecentDateStrings,
  computeBadges,
  getTodayStr,
  getTotalDays,
} from "../utils/storage";

const MotionDiv = motion.div;

export default function UserCard({ userData, darkMode, onStreakMilestone, onUpdate }) {
  const [weightInput, setWeightInput] = useState("");
  const [dishInput, setDishInput] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [calorieResult, setCalorieResult] = useState(null);

  const { name, gymDays, weights, calories } = userData;
  const profile = getUserProfile(name);
  const streak = calculateStreak(gymDays);
  const todayCalories = getTodayCalories(calories);
  const latestWeight = getLatestWeight(weights);
  const badges = computeBadges(userData);
  const totalGymDays = Object.values(gymDays).filter(Boolean).length;
  const progress = Math.min((totalGymDays / getTotalDays()) * 100, 100);

  const weekDates = getRecentDateStrings(7);
  const weeklyGymDays = countTruthyDates(gymDays, weekDates);
  const weeklyNutritionDays = countLoggedCalorieDays(calories, weekDates);
  const weeklyWeighIns = weekDates.filter((dateStr) => weights[dateStr] !== undefined).length;
  const weeklyTarget = 4;
  const goalProgress = Math.min((weeklyGymDays / weeklyTarget) * 100, 100);

  const handleGymToggle = (dateStr) => {
    const newGymDays = { ...gymDays };
    if (newGymDays[dateStr]) {
      delete newGymDays[dateStr];
    } else {
      newGymDays[dateStr] = true;
    }

    const newData = { ...userData, gymDays: newGymDays };
    onUpdate(newData);

    const newStreak = calculateStreak(newGymDays);
    if (newStreak > 0 && newStreak % 6 === 0 && newStreak > streak) {
      onStreakMilestone(newStreak);
    }
  };

  const handleWeightSubmit = (event) => {
    event.preventDefault();
    const parsedWeight = parseFloat(weightInput);
    if (isNaN(parsedWeight) || parsedWeight <= 0) return;

    const today = getTodayStr();
    onUpdate({
      ...userData,
      weights: { ...weights, [today]: parsedWeight },
    });
    setWeightInput("");
  };

  const handleDishSubmit = (event) => {
    event.preventDefault();
    if (!dishInput.trim()) return;

    const result = estimateCalories(dishInput);
    const today = getTodayStr();
    const todayEntries = calories[today] || [];
    const newEntry = {
      dish: dishInput,
      calories: result.total,
      breakdown: result.breakdown,
      time: new Date().toLocaleTimeString(),
    };

    setCalorieResult(result);
    onUpdate({
      ...userData,
      calories: { ...calories, [today]: [...todayEntries, newEntry] },
    });
    setDishInput("");
    setTimeout(() => setCalorieResult(null), 3000);
  };

  const todayEntries = calories[getTodayStr()] || [];
  const weeklyGoalCopy =
    weeklyGymDays >= weeklyTarget
      ? "Target locked in for the week."
      : `${weeklyTarget - weeklyGymDays} more gym day${
          weeklyTarget - weeklyGymDays === 1 ? "" : "s"
        } to hit the target.`;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-[30px] border border-white/50 bg-white/74 shadow-[0_28px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
    >
      <div className={`relative overflow-hidden bg-gradient-to-br ${profile.gradient} p-5 text-white`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.24),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.18),_transparent_34%)]" />
        <div className="absolute -right-10 top-2 h-28 w-28 rounded-full bg-white/12 blur-2xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/18 bg-white/14 text-3xl backdrop-blur-md">
              {profile.emoji}
            </div>
            <div className="text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                {profile.title}
              </p>
              <h3 className="mt-1 text-2xl font-semibold">{name}</h3>
              <p className="mt-2 max-w-[14rem] text-sm leading-6 text-white/82">{profile.goal}</p>
            </div>
          </div>
          <ProgressRing
            progress={progress}
            size={68}
            strokeWidth={5}
            colors={profile.ringColors}
            label={`${Math.round(progress)}%`}
          />
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className="rounded-2xl border border-white/16 bg-white/10 px-3 py-3 backdrop-blur-sm">
            <p className="text-white/65">Gym days</p>
            <p className="mt-1 text-lg font-semibold">{totalGymDays}</p>
          </div>
          <div className="rounded-2xl border border-white/16 bg-white/10 px-3 py-3 backdrop-blur-sm">
            <p className="text-white/65">Streak</p>
            <p className="mt-1 text-lg font-semibold">{streak} days</p>
          </div>
          <div className="rounded-2xl border border-white/16 bg-white/10 px-3 py-3 backdrop-blur-sm">
            <p className="text-white/65">Cal today</p>
            <p className="mt-1 text-lg font-semibold">{todayCalories}</p>
          </div>
          <div className="rounded-2xl border border-white/16 bg-white/10 px-3 py-3 backdrop-blur-sm">
            <p className="text-white/65">Latest weight</p>
            <p className="mt-1 text-lg font-semibold">{latestWeight ? `${latestWeight.weight}` : "—"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4 md:px-5">
        <div className={`rounded-[24px] bg-gradient-to-br ${profile.softGradient} p-4`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Weekly focus
              </p>
              <h4 className="mt-2 font-display text-lg font-semibold text-slate-950 dark:text-white">
                {weeklyGoalCopy}
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {profile.mantra}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.statTint}`}>
              {weeklyGymDays}/{weeklyTarget} workouts
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/60 dark:bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${profile.gradient}`}
              style={{ width: `${goalProgress}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/55 bg-white/70 px-3 py-3 text-center dark:border-white/10 dark:bg-white/6">
              <p className="text-lg font-semibold text-slate-950 dark:text-white">{weeklyGymDays}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                gym days
              </p>
            </div>
            <div className="rounded-2xl border border-white/55 bg-white/70 px-3 py-3 text-center dark:border-white/10 dark:bg-white/6">
              <p className="text-lg font-semibold text-slate-950 dark:text-white">{weeklyNutritionDays}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                meal logs
              </p>
            </div>
            <div className="rounded-2xl border border-white/55 bg-white/70 px-3 py-3 text-center dark:border-white/10 dark:bg-white/6">
              <p className="text-lg font-semibold text-slate-950 dark:text-white">{weeklyWeighIns}</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                weigh-ins
              </p>
            </div>
          </div>
        </div>

        <BadgeDisplay badges={badges} />
      </div>

      <div className="px-4 pb-4 md:px-5">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full rounded-2xl border border-slate-900/8 bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-95 dark:border-white/10 dark:bg-white dark:text-slate-950"
        >
          {showDetails ? "Hide Details ▲" : "Open Progress Studio ▼"}
        </button>
      </div>

      {showDetails && (
        <MotionDiv
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="space-y-4 px-4 pb-5 md:px-5"
        >
          <div className="soft-panel rounded-[26px] p-4">
            <h4 className="font-display text-base font-semibold text-slate-950 dark:text-white">
              Attendance heatmap
            </h4>
            <p className="mb-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tap a day to mark it complete and keep the chain alive.
            </p>
            <GymCalendar gymDays={gymDays} onToggle={handleGymToggle} />
          </div>

          <div className="soft-panel rounded-[26px] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-semibold text-slate-950 dark:text-white">
                  Weight tracker
                </h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Keep the trend visible with quick weigh-ins.
                </p>
              </div>
              <span className="rounded-full border border-slate-900/8 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {latestWeight ? `Latest ${latestWeight.weight} kg` : "No data yet"}
              </span>
            </div>
            <form onSubmit={handleWeightSubmit} className="mb-3 flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Enter today's weight (kg)"
                value={weightInput}
                onChange={(event) => setWeightInput(event.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-white dark:text-slate-950"
              >
                Log
              </button>
            </form>
            <WeightChart weights={weights} darkMode={darkMode} />
          </div>

          <div className="soft-panel rounded-[26px] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-semibold text-slate-950 dark:text-white">
                  Calorie tracker
                </h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Log meals fast and keep nutrition visible.
                </p>
              </div>
              <span className="rounded-full border border-slate-900/8 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {todayCalories} cal today
              </span>
            </div>

            <form onSubmit={handleDishSubmit} className="mb-3 flex gap-2">
              <input
                type="text"
                placeholder='e.g. "2 dosa and chutney"'
                value={dishInput}
                onChange={(event) => setDishInput(event.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Add
              </button>
            </form>

            {calorieResult && (
              <MotionDiv
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-3"
              >
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  +{calorieResult.total} calories added
                </p>
                <div className="mt-1 space-y-0.5 text-xs text-emerald-600 dark:text-emerald-500">
                  {calorieResult.breakdown.map((entry, index) => (
                    <p key={index}>
                      {entry.quantity}x {entry.item}: {entry.total} cal
                      {entry.estimated && " (estimated)"}
                    </p>
                  ))}
                </div>
              </MotionDiv>
            )}

            {todayEntries.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Today's log
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {todayEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="rounded-full border border-slate-900/8 bg-white/70 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/6"
                    >
                      <span className="text-slate-700 dark:text-slate-200">{entry.dish}</span>
                      <span className="ml-2 font-semibold text-orange-600 dark:text-orange-300">
                        {entry.calories} cal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <CalorieChart calories={calories} darkMode={darkMode} />
          </div>
        </MotionDiv>
      )}
    </MotionDiv>
  );
}
