import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

const MotionDiv = motion.div;

export default function CalorieWarningPopup({ show, message, title, tone = "warn", onClose }) {
  useEffect(() => {
    if (!show) return undefined;
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  const toneClasses =
    tone === "danger"
      ? "border-rose-300/40 bg-rose-500/95 text-white"
      : "border-amber-300/40 bg-amber-500/95 text-white";

  return (
    <AnimatePresence>
      {show && (
        <MotionDiv
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ type: "spring", damping: 16, stiffness: 240 }}
          className={`fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-[26px] border p-4 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur-xl ${toneClasses}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/18 text-xl">
              {tone === "danger" ? "!" : "⚠"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
                Daily food target
              </p>
              <h3 className="mt-1 text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-white/88">{message}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/18 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/16"
            >
              Close
            </button>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
