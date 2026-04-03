import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";

const MotionDiv = motion.div;

const cheers = [
  "You showed up today. That matters.",
  "Small wins stack up. Keep going.",
  "Consistency looks good on you.",
  "One more day locked in.",
];

export default function AttendanceCelebrationPopup({ show, userName, message, onClose }) {
  useEffect(() => {
    if (!show) return undefined;

    confetti({
      particleCount: 75,
      spread: 64,
      origin: { y: 0.72 },
      colors: ["#f97316", "#22c55e", "#f43f5e", "#facc15"],
    });

    const timer = setTimeout(onClose, 2800);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  const cheer = cheers[userName.length % cheers.length];

  return (
    <AnimatePresence>
      {show && (
        <MotionDiv
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", damping: 18, stiffness: 240 }}
          className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-[28px] border border-orange-200/60 bg-white/96 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-orange-400/20 dark:bg-slate-900/96"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-2xl text-white shadow-[0_14px_32px_rgba(249,115,22,0.34)]">
              ✓
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-300">
                Attendance saved
              </p>
              <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
                Nice work, {userName}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message}</p>
              <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{cheer}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-900/8 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
