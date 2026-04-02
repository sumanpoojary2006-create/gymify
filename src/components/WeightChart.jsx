import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function WeightChart({ weights, darkMode }) {
  const data = Object.entries(weights)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, weight]) => ({
      date: date.slice(5), // MM-DD
      weight: Number(weight),
    }));

  if (data.length === 0) {
    return (
      <div className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">
        No weight data yet. Start logging!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#334155" : "#e2e8f0"} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: darkMode ? "#94a3b8" : "#64748b" }}
          tickLine={false}
        />
        <YAxis
          domain={["dataMin - 2", "dataMax + 2"]}
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
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={{ fill: "#6366f1", r: 4 }}
          activeDot={{ r: 6, fill: "#818cf8" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
