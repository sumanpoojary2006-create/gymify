import { calculateStreak, getTodayCalories } from "../utils/storage";

export default function Leaderboard({ data }) {
  const users = Object.values(data).map((u) => ({
    name: u.name,
    streak: calculateStreak(u.gymDays),
    totalGymDays: Object.values(u.gymDays).filter(Boolean).length,
    todayCalories: getTodayCalories(u.calories),
    weightEntries: Object.keys(u.weights).length,
  }));

  // Sort by total gym days, then streak
  const sorted = [...users].sort((a, b) => {
    if (b.totalGymDays !== a.totalGymDays) return b.totalGymDays - a.totalGymDays;
    return b.streak - a.streak;
  });

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>🏆</span> Leaderboard
      </h3>
      <div className="space-y-3">
        {sorted.map((user, i) => (
          <div
            key={user.name}
            className={`flex items-center justify-between p-3 rounded-xl transition-all ${
              i === 0
                ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800"
                : "bg-gray-50 dark:bg-slate-700/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{medals[i] || `#${i + 1}`}</span>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.totalGymDays} gym days
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                🔥 {user.streak}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">streak</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
