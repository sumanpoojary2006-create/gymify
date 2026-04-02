import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getMonthLabel, getTodayStr } from "../utils/storage";

const MotionButton = motion.button;
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function GymCalendar({ gymDays, onToggle }) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const current = new Date();
    current.setDate(1);
    current.setHours(12, 0, 0, 0);
    return current;
  });
  const today = getTodayStr();
  const todayDate = useMemo(() => {
    const current = new Date();
    current.setHours(12, 0, 0, 0);
    return current;
  }, []);

  const calendarCells = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1, 12);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingEmpty = firstDay.getDay();

    return [
      ...Array.from({ length: leadingEmpty }, (_, index) => ({
        key: `empty-${index}`,
        empty: true,
      })),
      ...Array.from({ length: daysInMonth }, (_, index) => {
        const date = new Date(year, month, index + 1, 12);
        const dateStr = date.toISOString().split("T")[0];

        return {
          key: dateStr,
          date,
          dateStr,
          day: index + 1,
          isChecked: !!gymDays[dateStr],
          isToday: dateStr === today,
          isPast: date < todayDate,
          isFuture: date > todayDate,
        };
      }),
    ];
  }, [gymDays, today, todayDate, visibleMonth]);

  const handleMonthChange = (direction) => {
    setVisibleMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + direction);
      next.setDate(1);
      next.setHours(12, 0, 0, 0);
      return next;
    });
  };

  return (
    <div className="space-y-3 rounded-[22px] border border-slate-900/8 bg-white/55 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => handleMonthChange(-1)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          Prev
        </button>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {getMonthLabel(visibleMonth)}
        </p>
        <button
          type="button"
          onClick={() => handleMonthChange(1)}
          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          Next
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="pb-1 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500"
          >
            {label}
          </div>
        ))}

        {calendarCells.map((cell) =>
          cell.empty ? (
            <div key={cell.key} className="aspect-square" />
          ) : (
            <MotionButton
              key={cell.key}
              whileHover={cell.isToday ? { scale: 1.06 } : {}}
              whileTap={cell.isToday ? { scale: 0.94 } : {}}
              onClick={() => cell.isToday && onToggle(cell.dateStr)}
              disabled={!cell.isToday}
              className={`
                flex aspect-square w-full items-center justify-center rounded-xl text-[11px] font-semibold
                transition-all duration-200 border
                ${cell.isFuture
                  ? "cursor-not-allowed border-transparent bg-slate-200/60 text-slate-400 dark:bg-slate-800/60 dark:text-slate-600"
                  : cell.isPast && cell.isChecked
                    ? "cursor-not-allowed border-emerald-300 bg-emerald-500/90 text-white dark:border-emerald-500/50"
                    : cell.isPast
                      ? "cursor-not-allowed border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400"
                  : cell.isChecked
                    ? "border-emerald-400 bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.34)]"
                    : cell.isToday
                      ? "border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-500/50 dark:bg-orange-500/12 dark:text-orange-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-slate-500"
                }
              `}
              title={cell.isToday ? `${cell.dateStr} (today)` : `${cell.dateStr} (locked)`}
            >
              {cell.isChecked ? "✓" : cell.day}
            </MotionButton>
          )
        )}
      </div>
    </div>
  );
}
