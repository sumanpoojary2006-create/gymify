import { useState } from "react";
import { motion } from "framer-motion";
import { getUserProfile } from "../data/userProfiles";
import { isValidProfilePin } from "../data/profilePins";

const MotionSection = motion.section;

export default function ProfileLogin({ userNames, onLoginSuccess }) {
  const [selectedProfile, setSelectedProfile] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleProfileSelect = (name) => {
    setSelectedProfile(name);
    setPin("");
    setError("");
  };

  const handleBack = () => {
    setSelectedProfile("");
    setPin("");
    setError("");
  };

  const handleUnlock = (event) => {
    event.preventDefault();

    if (!selectedProfile) return;

    if (!isValidProfilePin(selectedProfile, pin)) {
      setError("Incorrect PIN. Try again.");
      return;
    }

    setError("");
    onLoginSuccess(selectedProfile);
  };

  return (
    <MotionSection
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-10"
    >
      <div className="w-full rounded-[32px] border border-white/55 bg-white/86 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/78 md:p-8">
        {!selectedProfile ? (
          <>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Welcome To Gymify
              </p>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
                Choose your profile
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
                Pick your profile first, then enter your 4-digit PIN to open your dashboard.
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
                    onClick={() => handleProfileSelect(name)}
                    className={`overflow-hidden rounded-[28px] bg-gradient-to-br ${profile.gradient} p-[1px] text-left shadow-[0_18px_50px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5`}
                  >
                    <div className="rounded-[27px] bg-white/14 p-5 text-white backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/18 bg-white/12 text-3xl">
                          {profile.emoji}
                        </div>
                        <span className="rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-semibold">
                          Continue
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
          </>
        ) : (
          <div className="mx-auto max-w-md">
            <button
              onClick={handleBack}
              className="mb-4 rounded-full border border-slate-900/8 bg-slate-900/4 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            >
              ← Change profile
            </button>

            <div
              className={`overflow-hidden rounded-[28px] bg-gradient-to-br ${getUserProfile(selectedProfile).gradient} p-[1px] shadow-[0_18px_50px_rgba(15,23,42,0.10)]`}
            >
              <div className="rounded-[27px] bg-white/14 p-6 text-white backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/18 bg-white/12 text-3xl">
                    {getUserProfile(selectedProfile).emoji}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                      Profile selected
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">{selectedProfile}</h2>
                  </div>
                </div>

                <form onSubmit={handleUnlock} className="mt-6">
                  <label className="block text-sm font-medium text-white/85">Enter 4-digit PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={pin}
                    onChange={(event) => {
                      const nextValue = event.target.value.replace(/\D/g, "").slice(0, 4);
                      setPin(nextValue);
                      setError("");
                    }}
                    placeholder="••••"
                    className="mt-3 w-full rounded-2xl border border-white/18 bg-white/12 px-4 py-3 text-center text-2xl tracking-[0.4em] text-white outline-none placeholder:text-white/45"
                  />

                  {error && <p className="mt-3 text-sm font-medium text-rose-100">{error}</p>}

                  <button
                    type="submit"
                    className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-95"
                  >
                    Unlock dashboard
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MotionSection>
  );
}
