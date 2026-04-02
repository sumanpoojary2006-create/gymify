import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function CalorieChart({ calories, darkMode }) {
  const data = Object.entries(calories)
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .slice(-14)
    .map(([date, entries]) => ({
      date: date.slice(5),
      calories: entries.reduce((sum, entry) => sum + (entry.calories || 0), 0),
    }));

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/50 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
        No calorie data yet. Log a meal to bring this chart to life.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 12, right: 10, left: -14, bottom: 5 }}>
        <defs>
          <linearGradient id="calorieBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke={darkMode ? "#334155" : "#e2e8f0"} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: darkMode ? "#94a3b8" : "#64748b" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: darkMode ? "#94a3b8" : "#64748b" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? "#020617" : "#fff7ed",
            border: `1px solid ${darkMode ? "#334155" : "#fdba74"}`,
            borderRadius: "16px",
            color: darkMode ? "#e2e8f0" : "#7c2d12",
            fontSize: "13px",
          }}
        />
        <Bar dataKey="calories" fill="url(#calorieBar)" radius={[10, 10, 4, 4]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
