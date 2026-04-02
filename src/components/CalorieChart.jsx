import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function CalorieChart({ calories, darkMode }) {
  const data = Object.entries(calories)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14) // Last 14 days
    .map(([date, entries]) => ({
      date: date.slice(5),
      calories: entries.reduce((sum, e) => sum + (e.calories || 0), 0),
    }));

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">
        No calorie data yet. Start tracking!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e2e8f0"} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: darkMode ? "#94a3b8" : "#64748b" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: darkMode ? "#94a3b8" : "#64748b" }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? "#1e293b" : "#fff",
            border: "1px solid " + (darkMode ? "#334155" : "#e2e8f0"),
            borderRadius: "8px",
            color: darkMode ? "#e2e8f0" : "#1e293b",
            fontSize: "13px",
          }}
        />
        <Bar dataKey="calories" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
