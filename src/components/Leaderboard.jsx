import {
  calculateStreak,
  getCalorieDeficitMetrics,
  getLeaderboardScore,
  getTodayCalories,
} from "../utils/storage";
import { getUserProfile } from "../data/userProfiles";

export default function Leaderboard({ data }) {
  const users = Object.values(data).map((user) => ({
    name: user.name,
    streak: calculateStreak(user.gymDays),
    totalGymDays: Object.values(user.gymDays).filter(Boolean).length,
    todayCalories: getTodayCalories(user.calories),
    weightEntries: Object.keys(user.weights).length,
    score: getLeaderboardScore(user),
    deficit: getCalorieDeficitMetrics(user).deficit,
    profile: getUserProfile(user.name),
  }));

  const sorted = [...users].sort((first, second) => {
    if (second.score !== first.score) {
      return second.score - first.score;
    }

    return second.totalGymDays - first.totalGymDays;
  });

  const podium = ["🥇", "🥈", "🥉"];

  return (
    <section className="rounded-[30px] border border-white/50 bg-white/74 p-5 shadow-[0_28px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 md:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Leaderboard
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">
            Who is setting the pace?
          </h2>
        </div>
        <span className="rounded-full border border-slate-900/8 bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          Score = calorie deficit + gym days x 10 + streak
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {sorted.map((user, index) => (
          <article
            key={user.name}
            className={`relative overflow-hidden rounded-[24px] border p-4 transition ${
              index === 0
                ? `border-transparent bg-gradient-to-br ${user.profile.gradient} text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]`
                : "border-slate-900/8 bg-white/72 text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-white"
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_26%)]" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/18 bg-white/14 text-2xl backdrop-blur-sm">
                  {index < 3 ? podium[index] : user.profile.emoji}
                </div>
                <div>
                  <p className="text-lg font-semibold">{user.name}</p>
                  <p
                    className={`text-sm ${
                      index === 0 ? "text-white/75" : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {user.profile.title}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-semibold">{user.score}</p>
                <p className={index === 0 ? "text-sm text-white/70" : "text-sm text-slate-500 dark:text-slate-400"}>
                  leaderboard score
                </p>
              </div>
            </div>

              <div className="relative mt-4 grid grid-cols-3 gap-2">
                <div className={`rounded-2xl px-3 py-3 text-center ${index === 0 ? "bg-white/14" : "bg-slate-900/5 dark:bg-white/5"}`}>
                  <p className="text-lg font-semibold">🔥 {user.streak}</p>
                <p className={`text-[11px] uppercase tracking-[0.18em] ${index === 0 ? "text-white/70" : "text-slate-500 dark:text-slate-400"}`}>
                  streak
                </p>
                </div>
                <div className={`rounded-2xl px-3 py-3 text-center ${index === 0 ? "bg-white/14" : "bg-slate-900/5 dark:bg-white/5"}`}>
                  <p className="text-lg font-semibold">{user.deficit}</p>
                  <p className={`text-[11px] uppercase tracking-[0.18em] ${index === 0 ? "text-white/70" : "text-slate-500 dark:text-slate-400"}`}>
                    deficit
                  </p>
                </div>
              <div className={`rounded-2xl px-3 py-3 text-center ${index === 0 ? "bg-white/14" : "bg-slate-900/5 dark:bg-white/5"}`}>
                <p className="text-lg font-semibold">{user.todayCalories}</p>
                <p className={`text-[11px] uppercase tracking-[0.18em] ${index === 0 ? "text-white/70" : "text-slate-500 dark:text-slate-400"}`}>
                  cal today
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
