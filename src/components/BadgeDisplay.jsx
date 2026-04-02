import { motion } from "framer-motion";

const MotionDiv = motion.div;

export default function BadgeDisplay({ badges }) {
  if (badges.length === 0) {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
        Keep going to unlock badges!
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
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
            bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700
            dark:from-indigo-900/40 dark:to-purple-900/40 dark:text-indigo-300"
          title={badge.label}
        >
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </MotionDiv>
      ))}
    </div>
  );
}
