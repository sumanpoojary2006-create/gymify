import { useState } from "react";
import { motion } from "framer-motion";
import GymCalendar from "./GymCalendar";
import WeightChart from "./WeightChart";
import CalorieChart from "./CalorieChart";
import BadgeDisplay from "./BadgeDisplay";
import ProgressRing from "./ProgressRing";
import { estimateCalories } from "../data/calorieDatabase";
import {
  calculateStreak,
  getTodayCalories,
  getLatestWeight,
  computeBadges,
  getTodayStr,
  getTotalDays,
} from "../utils/storage";

const avatarColors = {
  Suman: "from-indigo-500 to-purple-500",
  Adhiraj: "from-emerald-500 to-teal-500",
  Sitara: "from-rose-500 to-pink-500",
};

const MotionDiv = motion.div;

export default function UserCard({ userData, onUpdate, darkMode, onStreakMilestone }) {
  const [weightInput, setWeightInput] = useState("");
  const [dishInput, setDishInput] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [calorieResult, setCalorieResult] = useState(null);

  const { name, gymDays, weights, calories } = userData;
  const streak = calculateStreak(gymDays);
  const todayCalories = getTodayCalories(calories);
  const latestWeight = getLatestWeight(weights);
  const badges = computeBadges(userData);
  const totalGymDays = Object.values(gymDays).filter(Boolean).length;
  const progress = Math.min((totalGymDays / getTotalDays()) * 100, 100);

  const handleGymToggle = (dateStr) => {
    const newGymDays = { ...gymDays };
    if (newGymDays[dateStr]) {
      delete newGymDays[dateStr];
    } else {
      newGymDays[dateStr] = true;
    }
    const newData = { ...userData, gymDays: newGymDays };
    onUpdate(newData);

    // Check streak milestones
    const newStreak = calculateStreak(newGymDays);
    if (newStreak > 0 && newStreak % 6 === 0 && newStreak > streak) {
      onStreakMilestone(newStreak);
    }
  };

  const handleWeightSubmit = (e) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;
    const today = getTodayStr();
    const newWeights = { ...weights, [today]: w };
    onUpdate({ ...userData, weights: newWeights });
    setWeightInput("");
  };

  const handleDishSubmit = (e) => {
    e.preventDefault();
    if (!dishInput.trim()) return;
    const result = estimateCalories(dishInput);
    setCalorieResult(result);

    const today = getTodayStr();
    const todayEntries = calories[today] || [];
    const newEntry = {
      dish: dishInput,
      calories: result.total,
      breakdown: result.breakdown,
      time: new Date().toLocaleTimeString(),
    };
    const newCalories = { ...calories, [today]: [...todayEntries, newEntry] };
    onUpdate({ ...userData, calories: newCalories });
    setDishInput("");
    setTimeout(() => setCalorieResult(null), 3000);
  };

  const todayEntries = calories[getTodayStr()] || [];

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${avatarColors[name] || "from-indigo-500 to-purple-500"} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold text-white backdrop-blur-sm">
              {name[0]}
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-white">{name}</h3>
              <p className="text-white/80 text-xs">{totalGymDays} gym days completed</p>
            </div>
          </div>
          <ProgressRing progress={progress} size={56} strokeWidth={4} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        <div className="text-center p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">🔥 {streak}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Streak</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {latestWeight ? `${latestWeight.weight}` : "—"}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Weight (kg)</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{todayCalories}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Cal Today</p>
        </div>
      </div>

      {/* Badges */}
      <div className="px-4 pb-3">
        <BadgeDisplay badges={badges} />
      </div>

      {/* Toggle details */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline py-1"
        >
          {showDetails ? "Hide Details ▲" : "Show Details ▼"}
        </button>
      </div>

      {showDetails && (
        <MotionDiv
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4 space-y-4"
        >
          {/* Gym Calendar */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              📅 Gym Attendance
            </h4>
            <GymCalendar gymDays={gymDays} onToggle={handleGymToggle} />
          </div>

          {/* Weight Input */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ⚖️ Weight Tracker
            </h4>
            <form onSubmit={handleWeightSubmit} className="flex gap-2 mb-3">
              <input
                type="number"
                step="0.1"
                placeholder="Enter today's weight (kg)"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600
                  bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Log
              </button>
            </form>
            <WeightChart weights={weights} darkMode={darkMode} />
          </div>

          {/* Calorie Input */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              🍽️ Calorie Tracker
            </h4>
            <form onSubmit={handleDishSubmit} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder='e.g. "2 dosa and chutney"'
                value={dishInput}
                onChange={(e) => setDishInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600
                  bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </form>

            {/* Calorie result popup */}
            {calorieResult && (
              <MotionDiv
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              >
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  +{calorieResult.total} calories added
                </p>
                <div className="text-xs text-green-600 dark:text-green-500 mt-1 space-y-0.5">
                  {calorieResult.breakdown.map((b, i) => (
                    <p key={i}>
                      {b.quantity}x {b.item}: {b.total} cal
                      {b.estimated && " (estimated)"}
                    </p>
                  ))}
                </div>
              </MotionDiv>
            )}

            {/* Today's food log */}
            {todayEntries.length > 0 && (
              <div className="mb-3 space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Today's log:</p>
                {todayEntries.map((entry, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-xs px-2 py-1.5 rounded-md bg-gray-50 dark:bg-slate-700/50"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{entry.dish}</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {entry.calories} cal
                    </span>
                  </div>
                ))}
              </div>
            )}

            <CalorieChart calories={calories} darkMode={darkMode} />
          </div>
        </MotionDiv>
      )}
    </MotionDiv>
  );
}
