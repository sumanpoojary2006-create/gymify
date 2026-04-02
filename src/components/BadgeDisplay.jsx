import { motion } from "framer-motion";

const MotionDiv = motion.div;

export default function BadgeDisplay({ badges }) {
  if (badges.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300/80 bg-white/55 px-4 py-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
        Keep stacking days. Your first badge is closer than it feels.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, i) => (
        <MotionDiv
          key={badge.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1, type: "spring", damping: 12 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]
            dark:border-white/10 dark:bg-white/8 dark:text-slate-200"
          title={badge.label}
        >
          <span className="text-sm">{badge.icon}</span>
          <span>{badge.label}</span>
        </MotionDiv>
      ))}
    </div>
  );
}
