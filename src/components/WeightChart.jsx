import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function WeightChart({ darkMode, weights }) {
  const data = Object.entries(weights)
    .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
    .map(([date, weight]) => ({
      date: date.slice(5),
      weight: Number(weight),
    }));

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/50 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
        No weight data yet. Start logging to reveal the trend.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={data} margin={{ top: 12, right: 10, left: -14, bottom: 5 }}>
        <defs>
          <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
          domain={["dataMin - 2", "dataMax + 2"]}
          tick={{ fontSize: 11, fill: darkMode ? "#94a3b8" : "#64748b" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: darkMode ? "#020617" : "#fff7ed",
            border: `1px solid ${darkMode ? "#334155" : "#fed7aa"}`,
            borderRadius: "16px",
            color: darkMode ? "#e2e8f0" : "#7c2d12",
            fontSize: "13px",
          }}
        />
        <Area
          type="monotone"
          dataKey="weight"
          stroke="#f97316"
          strokeWidth={3}
          fill="url(#weightFill)"
          dot={{ fill: "#f97316", r: 4 }}
          activeDot={{ r: 6, fill: "#fb923c" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
