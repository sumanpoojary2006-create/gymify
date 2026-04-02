import { motion } from "framer-motion";
import {
  countLoggedCalorieDays,
  countTruthyDates,
  getRecentDateStrings,
} from "../utils/storage";

const MotionSection = motion.section;

function clampProgress(current, target) {
  if (target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
}

export default function WeeklyChallenges({ data }) {
  const users = Object.values(data);
  const weekDates = getRecentDateStrings(7);
  const totalUsers = users.length || 1;

  const gymWins = users.reduce((sum, user) => sum + countTruthyDates(user.gymDays, weekDates), 0);
  const nutritionWins = users.reduce(
    (sum, user) => sum + countLoggedCalorieDays(user.calories, weekDates),
    0
  );
  const weighIns = users.reduce(
    (sum, user) => sum + weekDates.filter((dateStr) => user.weights[dateStr] !== undefined).length,
    0
  );

  const challengeCards = [
    {
      kicker: "Weekly mission",
      title: "Lock in 12 total gym sessions",
      current: gymWins,
      target: Math.max(totalUsers * 4, 12),
      unit: "sessions",
      tone: "from-orange-500 to-amber-400",
      glow: "bg-orange-500/12 text-orange-700 dark:text-orange-300",
      note: "Keep the room buzzing with consistent check-ins.",
    },
    {
      kicker: "Nutrition streak",
      title: "Log calories on 10 crew-days",
      current: nutritionWins,
      target: Math.max(totalUsers * 3, 10),
      unit: "log days",
      tone: "from-emerald-500 to-cyan-400",
      glow: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
      note: "Nutrition consistency counts as much as training energy.",
    },
    {
      kicker: "Check the trend",
      title: "Hit 6 weight updates this week",
      current: weighIns,
      target: Math.max(totalUsers * 2, 6),
      unit: "weigh-ins",
      tone: "from-fuchsia-500 to-rose-400",
      glow: "bg-fuchsia-500/12 text-fuchsia-700 dark:text-fuchsia-300",
      note: "A few clean data points make progress easier to see.",
    },
  ];

  return (
    <MotionSection
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[30px] border border-white/50 bg-white/70 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65 md:p-6"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Crew Missions
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">
            Weekly challenges that keep the team moving
          </h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
          These reset every week and give everyone a short-term reason to keep showing up.
        </p>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {challengeCards.map((card, index) => {
          const progress = clampProgress(card.current, card.target);
          const completed = card.current >= card.target;

          return (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 * index }}
              className="relative overflow-hidden rounded-[26px] border border-slate-900/8 bg-slate-950 p-5 text-white shadow-[0_24px_60px_rgba(15,23,42,0.24)] dark:border-white/10"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.tone}`} />
              <div className="absolute -right-10 top-6 h-24 w-24 rounded-full bg-white/8 blur-2xl" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                {card.kicker}
              </p>
              <h3 className="mt-3 text-xl font-semibold leading-7">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{card.note}</p>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold">
                    {card.current}
                    <span className="ml-2 text-base font-medium text-slate-400">/ {card.target}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{card.unit}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${card.glow}`}>
                  {completed ? "Completed" : `${Math.round(progress)}% there`}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${card.tone}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.article>
          );
        })}
      </div>
    </MotionSection>
  );
}
