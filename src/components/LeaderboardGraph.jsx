import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { calculateStreak, getLeaderboardScore } from "../utils/storage";
import { getUserProfile } from "../data/userProfiles";

export default function LeaderboardGraph({ darkMode, data }) {
  const chartData = Object.values(data)
    .map((user) => {
      const profile = getUserProfile(user.name);
      return {
        name: user.name,
        score: getLeaderboardScore(user),
        totalGymDays: Object.values(user.gymDays).filter(Boolean).length,
        streak: calculateStreak(user.gymDays),
        color: profile.ringColors[0],
      };
    })
    .sort((first, second) => second.score - first.score);

  return (
    <section className="rounded-[30px] border border-white/50 bg-white/74 p-5 shadow-[0_28px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 md:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Graph
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">
            Leaderboard score graph
          </h2>
        </div>
        <span className="rounded-full border border-slate-900/8 bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          Score = gym days x 10 + streak
        </span>
      </div>

      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -12, bottom: 10 }}>
            <CartesianGrid strokeDasharray="4 4" stroke={darkMode ? "#334155" : "#e2e8f0"} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: darkMode ? "#94a3b8" : "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: darkMode ? "#94a3b8" : "#64748b" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: darkMode ? "rgba(148,163,184,0.08)" : "rgba(15,23,42,0.04)" }}
              contentStyle={{
                backgroundColor: darkMode ? "#020617" : "#ffffff",
                border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                borderRadius: "16px",
                color: darkMode ? "#e2e8f0" : "#0f172a",
                fontSize: "13px",
              }}
              formatter={(value, _, payload) => [
                `${value} points`,
                `${payload?.payload?.totalGymDays || 0} gym days, ${payload?.payload?.streak || 0} streak`,
              ]}
            />
            <Bar dataKey="score" radius={[12, 12, 4, 4]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
