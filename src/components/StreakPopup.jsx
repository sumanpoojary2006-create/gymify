import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";

const messages = [
  "You're unstoppable. Keep pushing!",
  "Beast mode activated!",
  "Champions never quit!",
  "Your dedication is inspiring!",
  "Nothing can stop you now!",
  "Discipline beats motivation every time!",
];

const MotionDiv = motion.div;

export default function StreakPopup({ show, streak, userName, onClose }) {
  useEffect(() => {
    if (show) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
      });
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const msg = messages[(streak + userName.length) % messages.length];

  return (
    <AnimatePresence>
      {show && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <MotionDiv
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">🔥</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {streak} Day Streak!
            </h2>
            <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium mb-2">
              {userName}
            </p>
            <p className="text-gray-600 dark:text-gray-300">{msg}</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium transition-colors"
            >
              Let's Go!
            </button>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
