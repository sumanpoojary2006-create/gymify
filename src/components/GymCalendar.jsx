import { motion } from "framer-motion";
import { getTotalDays, getDateForDay, getDayNumber, getTodayStr } from "../utils/storage";

const MotionButton = motion.button;

export default function GymCalendar({ gymDays, onToggle }) {
  const totalDays = getTotalDays();
  const today = getTodayStr();
  const currentDay = getDayNumber(today);

  return (
    <div className="grid grid-cols-10 gap-1.5 rounded-[22px] border border-slate-900/8 bg-white/55 p-3 dark:border-white/10 dark:bg-white/5">
      {Array.from({ length: totalDays }, (_, i) => {
        const day = i + 1;
        const dateStr = getDateForDay(day);
        const isChecked = !!gymDays[dateStr];
        const isToday = dateStr === today;
        const isFuture = day > currentDay;

        return (
          <MotionButton
            key={day}
            whileHover={!isFuture ? { scale: 1.2 } : {}}
            whileTap={!isFuture ? { scale: 0.9 } : {}}
            onClick={() => !isFuture && onToggle(dateStr)}
            disabled={isFuture}
            className={`
              flex aspect-square w-full items-center justify-center rounded-xl text-[10px] font-semibold
              transition-all duration-200 border
              ${isFuture
                ? "cursor-not-allowed border-transparent bg-slate-200/60 text-slate-400 dark:bg-slate-800/60 dark:text-slate-600"
                : isChecked
                  ? "border-emerald-400 bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.34)]"
                  : isToday
                    ? "border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-500/50 dark:bg-orange-500/12 dark:text-orange-300"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-slate-500"
              }
            `}
            title={`Day ${day} - ${dateStr}`}
          >
            {isChecked ? "✓" : day}
          </MotionButton>
        );
      })}
    </div>
  );
}
