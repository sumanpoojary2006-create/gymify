import { useState } from "react";
import { motion } from "framer-motion";
import GymCalendar from "./GymCalendar";
import WeightChart from "./WeightChart";
import CalorieChart from "./CalorieChart";
import BadgeDisplay from "./BadgeDisplay";
import ProgressRing from "./ProgressRing";
import TdeeCalculator from "./TdeeCalculator";
import { estimateCalories } from "../data/calorieDatabase";
import { getUserProfile } from "../data/userProfiles";
import {
  calculateBmi,
  calculateStreak,
  countTruthyDates,
  getLatestWeight,
  getRecentDateStrings,
  getTodayCalories,
  getTodayStr,
  getTotalDays,
  computeBadges,
} from "../utils/storage";

const MotionDiv = motion.div;

export default function UserCard({ userData, darkMode, onStreakMilestone, onUpdate }) {
  const [weightInput, setWeightInput] = useState("");
  const [dishInput, setDishInput] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showHealthTools, setShowHealthTools] = useState(false);
  const [calorieResult, setCalorieResult] = useState(null);

  const { name, gymDays, weights, calories, bodyProfile } = userData;
  const profile = getUserProfile(name);
  const streak = calculateStreak(gymDays);
  const latestWeight = getLatestWeight(weights);
  const badges = computeBadges(userData);
  const todayCalories = getTodayCalories(calories);
  const totalGymDays = Object.values(gymDays).filter(Boolean).length;
  const progress = Math.min((totalGymDays / getTotalDays()) * 100, 100);
  const weeklyGymDays = countTruthyDates(gymDays, getRecentDateStrings(7));

  const handleGymToggle = (dateStr) => {
    const newGymDays = { ...gymDays };
    if (newGymDays[dateStr]) {
      delete newGymDays[dateStr];
    } else {
      newGymDays[dateStr] = true;
    }

    onUpdate({ ...userData, gymDays: newGymDays });

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
    const bmiResult = calculateBmi({
      heightCm: bodyProfile.heightCm,
      weightKg: parsedWeight,
    });
    onUpdate({
      ...userData,
      bodyProfile: {
        ...bodyProfile,
        bmi: bmiResult?.bmi || bodyProfile.bmi || "",
        bmiCategory: bmiResult?.category || bodyProfile.bmiCategory || "",
      },
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

  const handleBodyProfileSave = (nextBodyProfile) => {
    const effectiveWeight = latestWeight?.weight || nextBodyProfile.weightKg;
    const bmiResult = calculateBmi({
      heightCm: nextBodyProfile.heightCm,
      weightKg: effectiveWeight,
    });

    onUpdate({
      ...userData,
      bodyProfile: {
        ...bodyProfile,
        ...nextBodyProfile,
        bmi: bmiResult?.bmi || bodyProfile.bmi || "",
        bmiCategory: bmiResult?.category || bodyProfile.bmiCategory || "",
      },
    });
  };

  const todayEntries = calories[getTodayStr()] || [];

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-[28px] border border-white/55 bg-white/82 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/72"
    >
      <div className={`bg-gradient-to-r ${profile.gradient} p-5 text-white`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm">
              {profile.emoji}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                {profile.title}
              </p>
              <h3 className="mt-1 text-2xl font-semibold">{name}</h3>
              <p className="mt-2 text-sm text-white/85">{profile.goal}</p>
            </div>
          </div>

          <ProgressRing
            progress={progress}
            size={60}
            strokeWidth={5}
            colors={profile.ringColors}
            label={`${Math.round(progress)}%`}
          />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-3 py-3 text-center dark:border-white/10 dark:bg-white/5">
            <p className="text-lg font-semibold text-slate-950 dark:text-white">🔥 {streak}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              streak
            </p>
          </div>
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-3 py-3 text-center dark:border-white/10 dark:bg-white/5">
            <p className="text-lg font-semibold text-slate-950 dark:text-white">
              {latestWeight ? latestWeight.weight : "—"}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              weight
            </p>
          </div>
          <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-3 py-3 text-center dark:border-white/10 dark:bg-white/5">
            <p className="text-lg font-semibold text-slate-950 dark:text-white">{weeklyGymDays}</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              this week
            </p>
          </div>
        </div>

        <BadgeDisplay badges={badges} />

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full rounded-2xl border border-slate-900/8 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:border-white/10 dark:bg-white dark:text-slate-950"
        >
          {showDetails ? "Hide details ▲" : "Open details ▼"}
        </button>
      </div>

      {showDetails && (
        <MotionDiv
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="space-y-4 px-5 pb-5"
        >
          <div className="soft-panel rounded-[24px] p-4">
            <h4 className="font-display text-base font-semibold text-slate-950 dark:text-white">
              Gym attendance
            </h4>
            <p className="mb-3 mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tap a day to mark the workout complete.
            </p>
            <GymCalendar gymDays={gymDays} onToggle={handleGymToggle} />
          </div>

          <div className="soft-panel rounded-[24px] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-semibold text-slate-950 dark:text-white">
                  Weight
                </h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Add the latest number and follow the trend.
                </p>
              </div>
              <span className="rounded-full border border-slate-900/8 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {latestWeight ? `${latestWeight.weight} kg` : "No data"}
              </span>
            </div>

            <form onSubmit={handleWeightSubmit} className="mb-3 flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Today's weight (kg)"
                value={weightInput}
                onChange={(event) => setWeightInput(event.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-white dark:text-slate-950"
              >
                Save
              </button>
            </form>

            <WeightChart weights={weights} darkMode={darkMode} />
          </div>

          <div className="soft-panel rounded-[24px] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-semibold text-slate-950 dark:text-white">
                  Calories
                </h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Quick meal logging with a simple daily summary.
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
              </MotionDiv>
            )}

            {todayEntries.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Today
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

          <div className="soft-panel rounded-[24px] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-semibold text-slate-950 dark:text-white">
                  Health tools
                </h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Open TDEE, BMI, and deficit analysis only when you need it.
                </p>
              </div>
              <button
                onClick={() => setShowHealthTools(!showHealthTools)}
                className="rounded-2xl border border-slate-900/8 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 dark:border-white/10 dark:bg-white dark:text-slate-950"
              >
                {showHealthTools ? "Hide" : "Open"}
              </button>
            </div>

            {showHealthTools && (
              <div className="mt-4">
                <TdeeCalculator
                  bodyProfile={bodyProfile}
                  latestWeight={latestWeight}
                  todayCalories={todayCalories}
                  onSaveBodyProfile={handleBodyProfileSave}
                />
              </div>
            )}
          </div>
        </MotionDiv>
      )}
    </MotionDiv>
  );
}
