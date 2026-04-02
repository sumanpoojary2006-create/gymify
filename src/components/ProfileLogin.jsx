import { motion } from "framer-motion";
import { getUserProfile } from "../data/userProfiles";

const MotionSection = motion.section;

export default function ProfileLogin({ userNames, onSelectUser }) {
  return (
    <MotionSection
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10"
    >
      <div className="w-full rounded-[32px] border border-white/55 bg-white/86 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/78 md:p-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Welcome To Gymify
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
            Choose your profile to open your progress
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
            This keeps the app focused on one person at a time, with a quick switch option if
            someone else picks up the phone.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {userNames.map((name, index) => {
            const profile = getUserProfile(name);

            return (
              <motion.button
                key={name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index }}
                onClick={() => onSelectUser(name)}
                className={`overflow-hidden rounded-[28px] bg-gradient-to-br ${profile.gradient} p-[1px] text-left shadow-[0_18px_50px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5`}
              >
                <div className="rounded-[27px] bg-white/14 p-5 text-white backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/18 bg-white/12 text-3xl">
                      {profile.emoji}
                    </div>
                    <span className="rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-semibold">
                      Open
                    </span>
                  </div>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                    {profile.title}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{name}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/82">{profile.goal}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
}
