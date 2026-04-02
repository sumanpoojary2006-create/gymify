import { motion } from "framer-motion";
import { getTotalDays, getDateForDay, getDayNumber, getTodayStr } from "../utils/storage";

const MotionButton = motion.button;

export default function GymCalendar({ gymDays, onToggle }) {
  const totalDays = getTotalDays();
  const today = getTodayStr();
  const currentDay = getDayNumber(today);

  return (
    <div className="grid grid-cols-10 gap-1">
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
              w-full aspect-square rounded-md text-[10px] font-medium flex items-center justify-center
              transition-all duration-200 border
              ${isFuture
                ? "bg-gray-100 dark:bg-slate-700/30 text-gray-300 dark:text-slate-600 border-transparent cursor-not-allowed"
                : isChecked
                  ? "bg-green-500 text-white border-green-600 shadow-sm shadow-green-500/30"
                  : isToday
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700"
                    : "bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600"
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
