import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import UserCard from "./components/UserCard";
import Leaderboard from "./components/Leaderboard";
import StreakPopup from "./components/StreakPopup";
import {
  loadData,
  saveData,
  normalizeData,
  getUserNames,
  getCurrentDayNumber,
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

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MotionH1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              >
                60 Day Lean Challenge
              </MotionH1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                Day {Math.min(Math.max(dayNumber, 1), totalDays)}/{totalDays}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  cloudSyncEnabled
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                }`}
              >
                {cloudSyncEnabled ? "Shared cloud sync" : "Local-only mode"}
              </span>

              {/* Tab nav */}
              <nav className="hidden sm:flex bg-gray-100 dark:bg-slate-800 rounded-lg p-0.5">
                {[
                  { id: "dashboard", label: "Dashboard" },
                  { id: "leaderboard", label: "Leaderboard" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                      activeTab === tab.id
                        ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                title="Toggle dark mode"
              >
                <MotionSpan
                  key={darkMode ? "moon" : "sun"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  className="block text-lg"
                >
                  {darkMode ? "☀️" : "🌙"}
                </MotionSpan>
              </button>
            </div>
          </div>

          {/* Challenge progress bar */}
          <div className="mt-2">
            <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <MotionDiv
                initial={{ width: 0 }}
                animate={{ width: `${challengeProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">
              {Math.round(challengeProgress)}% of challenge complete
            </p>
          </div>
        </div>
      </header>

      {/* Mobile tab nav */}
      <div className="sm:hidden flex bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        {[
          { id: "dashboard", label: "📊 Dashboard" },
          { id: "leaderboard", label: "🏆 Leaderboard" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : (
          <div className="max-w-lg mx-auto">
            <Leaderboard data={data} />
          </div>
        )}
      </main>

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
