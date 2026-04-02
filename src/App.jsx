import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import UserCard from "./components/UserCard";
import Leaderboard from "./components/Leaderboard";
import StreakPopup from "./components/StreakPopup";
import ChallengeHero from "./components/ChallengeHero";
import WeeklyChallenges from "./components/WeeklyChallenges";
import {
  loadData,
  saveData,
  normalizeData,
  getUserNames,
  getCurrentDayNumber,
  getTodayStr,
  getTotalDays,
} from "./utils/storage";
import {
  isFirebaseReady,
  saveToFirebase,
  subscribeToFirebase,
} from "./utils/firebase";

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionSpan = motion.span;
const MotionMain = motion.main;

function App() {
  const [data, setData] = useState(loadData);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("lean-challenge-dark") === "true";
  });
  const [streakPopup, setStreakPopup] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const cloudSyncEnabled = isFirebaseReady();
  const [cloudHydrated, setCloudHydrated] = useState(() => !cloudSyncEnabled);
  const lastRemoteSnapshotRef = useRef(null);

  useEffect(() => {
    if (!cloudSyncEnabled) return undefined;

    const unsubscribe = subscribeToFirebase((remoteData) => {
      const nextData = remoteData ? normalizeData(remoteData) : loadData();
      const nextDataJson = JSON.stringify(nextData);

      lastRemoteSnapshotRef.current = nextDataJson;
      setCloudHydrated(true);
      setData((prev) => {
        const prevJson = JSON.stringify(prev);
        return prevJson === nextDataJson ? prev : nextData;
      });

      if (!remoteData) {
        saveToFirebase(nextData);
      }
    });

    return unsubscribe;
  }, [cloudSyncEnabled]);

  useEffect(() => {
    saveData(data);
    if (!cloudSyncEnabled || !cloudHydrated) return;

    const currentDataJson = JSON.stringify(data);
    if (lastRemoteSnapshotRef.current === currentDataJson) return;

    lastRemoteSnapshotRef.current = currentDataJson;
    saveToFirebase(data);
  }, [cloudHydrated, cloudSyncEnabled, data]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("lean-challenge-dark", darkMode);
  }, [darkMode]);

  const handleUserUpdate = useCallback((name, newUserData) => {
    setData((prev) => ({ ...prev, [name]: newUserData }));
  }, []);

  const handleStreakMilestone = useCallback((name, streak) => {
    setStreakPopup({ name, streak });
  }, []);

  const closeStreakPopup = useCallback(() => setStreakPopup(null), []);

  const dayNumber = getCurrentDayNumber();
  const totalDays = getTotalDays();
  const challengeProgress = Math.min(Math.max((dayNumber / totalDays) * 100, 0), 100);
  const today = getTodayStr();
  const users = Object.values(data);
  const todayCheckIns = users.filter((user) => user.gymDays[today]).length;
  const todayCalorieLogs = users.filter((user) => (user.calories[today] || []).length > 0).length;

  return (
    <div
      className={`app-shell min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-slate-950 text-white" : "bg-[var(--page-bg)] text-slate-950"
      }`}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="mesh-orb mesh-orb-one" />
        <div className="mesh-orb mesh-orb-two" />
        <div className="mesh-orb mesh-orb-three" />
        <div className="noise-overlay" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-900/8 bg-white/65 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <MotionH1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-display text-xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-2xl"
              >
                Gymify
              </MotionH1>
              <span className="hidden items-center rounded-full border border-slate-900/8 bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 sm:inline-flex">
                Day {Math.min(Math.max(dayNumber, 1), totalDays)}/{totalDays}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`hidden md:inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  cloudSyncEnabled
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                }`}
              >
                {cloudSyncEnabled ? "Shared cloud sync" : "Local-only mode"}
              </span>

              {/* Tab nav */}
              <nav className="hidden rounded-full border border-slate-900/8 bg-white/65 p-1 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 sm:flex">
                {[
                  { id: "dashboard", label: "Dashboard", icon: "⚡" },
                  { id: "leaderboard", label: "Leaderboard", icon: "🏁" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      activeTab === tab.id
                        ? "bg-slate-950 text-white shadow-[0_10px_20px_rgba(15,23,42,0.18)] dark:bg-white dark:text-slate-950"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-full border border-slate-900/8 bg-white/75 p-2.5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-colors hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                title="Toggle dark mode"
              >
                <MotionSpan
                  key={darkMode ? "moon" : "sun"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  className="block text-lg"
                >
                  {darkMode ? "☀️" : "🌗"}
                </MotionSpan>
              </button>
            </div>
          </div>

          {/* Challenge progress bar */}
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/8 dark:bg-white/10">
              <MotionDiv
                initial={{ width: 0 }}
                animate={{ width: `${challengeProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-sky-500"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <p>{Math.round(challengeProgress)}% of the full challenge is complete</p>
              <div className="flex flex-wrap gap-2">
                <span className="stat-pill">🔥 {todayCheckIns} checked in today</span>
                <span className="stat-pill">🍽️ {todayCalorieLogs} meal logs today</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <MotionMain
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 pb-28 md:px-6 md:pb-10"
      >
        <ChallengeHero data={data} cloudSyncEnabled={cloudSyncEnabled} />

        {activeTab === "dashboard" ? (
          <>
            <WeeklyChallenges data={data} />

            <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
                {getUserNames().map((name) => (
                  <UserCard
                    key={name}
                    userData={data[name]}
                    darkMode={darkMode}
                    onUpdate={(newData) => handleUserUpdate(name, newData)}
                    onStreakMilestone={(streak) => handleStreakMilestone(name, streak)}
                  />
                ))}
              </div>

              <div className="xl:sticky xl:top-32 xl:self-start">
                <Leaderboard data={data} />
              </div>
            </section>
          </>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Leaderboard data={data} />
            <WeeklyChallenges data={data} />
          </div>
        )}
      </MotionMain>

      <nav className="fixed inset-x-4 bottom-4 z-40 flex rounded-full border border-slate-900/10 bg-white/88 p-1.5 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/88 sm:hidden">
        {[
          { id: "dashboard", label: "Dashboard", icon: "⚡" },
          { id: "leaderboard", label: "Leaderboard", icon: "🏁" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                : "text-slate-500 dark:text-slate-300"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Streak Popup */}
      {streakPopup && (
        <StreakPopup
          show={!!streakPopup}
          streak={streakPopup.streak}
          userName={streakPopup.name}
          onClose={closeStreakPopup}
        />
      )}
    </div>
  );
}

export default App;
