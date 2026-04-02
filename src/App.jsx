import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import UserCard from "./components/UserCard";
import Leaderboard from "./components/Leaderboard";
import MealsFeed from "./components/MealsFeed";
import ProfileSection from "./components/ProfileSection";
import WorkoutHelperModal from "./components/WorkoutHelperModal";
import StreakPopup from "./components/StreakPopup";
import ProfileLogin from "./components/ProfileLogin";
import {
  createUserData,
  loadData,
  saveData,
  normalizeData,
  getUserNames,
  getMonthAttendanceSummary,
  getMonthLabel,
  isRegisteredUser,
  getTodayStr,
} from "./utils/storage";
import { getUserProfile } from "./data/userProfiles";
import { isFirebaseReady, saveToFirebase, subscribeToFirebase } from "./utils/firebase";

const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionSpan = motion.span;
const SELECTED_USER_KEY = "gymify-selected-user";

export default function App() {
  const [data, setData] = useState(loadData);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("lean-challenge-dark") === "true");
  const [streakPopup, setStreakPopup] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showWorkoutHelper, setShowWorkoutHelper] = useState(false);
  const [selectedUser, setSelectedUser] = useState(() => {
    const savedUser = localStorage.getItem(SELECTED_USER_KEY);
    return savedUser || "";
  });
  const cloudSyncEnabled = isFirebaseReady();
  const [cloudHydrated, setCloudHydrated] = useState(() => !cloudSyncEnabled);
  const lastRemoteSnapshotRef = useRef(null);
  const userNames = getUserNames(data);
  const visibleData = Object.fromEntries(userNames.map((name) => [name, data[name]]));
  const activeUser = selectedUser && isRegisteredUser(data[selectedUser]) ? selectedUser : "";

  useEffect(() => {
    if (!cloudSyncEnabled) return undefined;

    const unsubscribe = subscribeToFirebase((remoteData) => {
      const nextData = remoteData ? normalizeData(remoteData) : loadData();
      const nextDataJson = JSON.stringify(nextData);

      lastRemoteSnapshotRef.current = nextDataJson;
      setCloudHydrated(true);
      setData((previousData) => {
        const previousJson = JSON.stringify(previousData);
        return previousJson === nextDataJson ? previousData : nextData;
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

  useEffect(() => {
    if (!activeUser) {
      localStorage.removeItem(SELECTED_USER_KEY);
      return;
    }

    localStorage.setItem(SELECTED_USER_KEY, activeUser);
  }, [activeUser]);

  const handleUserUpdate = useCallback((name, newUserData) => {
    setData((previousData) => ({ ...previousData, [name]: newUserData }));
  }, []);

  const handleStreakMilestone = useCallback((name, streak) => {
    setStreakPopup({ name, streak });
  }, []);

  const closeStreakPopup = useCallback(() => setStreakPopup(null), []);

  const handleDeleteProfile = useCallback((name) => {
    setData((previousData) => {
      const nextData = { ...previousData };
      delete nextData[name];
      return nextData;
    });
    setSelectedUser("");
    setActiveTab("dashboard");
  }, []);

  const handleLogin = useCallback(
    ({ name, password }) => {
      const existingUser = data[name];

      if (!name || !password) {
        return { ok: false, message: "Enter your username and password." };
      }

      if (!isRegisteredUser(existingUser)) {
        return { ok: false, message: "No account found with that username." };
      }

      if (existingUser.auth.password !== password) {
        return { ok: false, message: "Incorrect password. Try again." };
      }

      setSelectedUser(name);
      setActiveTab("dashboard");
      return { ok: true };
    },
    [data]
  );

  const handleSignup = useCallback(
    ({ activity, age, heightCm, name, password, sex, weightKg }) => {
      if (!name || !password || !age || !heightCm || !weightKg || !sex) {
        return { ok: false, message: "Fill in all sign-up details." };
      }

      const existingUser = data[name];
      if (isRegisteredUser(existingUser)) {
        return { ok: false, message: "That username is already taken." };
      }

      const createdUser = createUserData({
        activity,
        age,
        heightCm,
        name,
        password,
        sex,
        weightKg,
      });

      setData((previousData) => ({
        ...previousData,
        [name]: createdUser,
      }));
      setSelectedUser(name);
      setActiveTab("dashboard");
      return { ok: true };
    },
    [data]
  );

  const today = getTodayStr();
  const users = Object.values(visibleData);
  const todayCheckIns = users.filter((user) => user.gymDays[today]).length;
  const todayMealLogs = users.reduce((count, user) => count + (user.calories[today] || []).length, 0);
  const totalMonthlyAttendance = users.reduce(
    (count, user) => count + getMonthAttendanceSummary(user.gymDays).attendedDays,
    0
  );
  const currentMonthLabel = getMonthLabel();
  const selectedProfile = activeUser ? getUserProfile(activeUser) : null;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "meals", label: "Meals", icon: "🍽️" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
  ];

  if (!activeUser) {
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
        </div>

        <div className="absolute right-4 top-4 z-20">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full border border-slate-900/8 bg-white/85 p-2.5 text-lg shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            title="Toggle dark mode"
          >
            <MotionSpan
              key={darkMode ? "moon" : "sun"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              className="block"
            >
              {darkMode ? "☀️" : "🌗"}
            </MotionSpan>
          </button>
        </div>

        <ProfileLogin existingUsers={userNames} onLogin={handleLogin} onSignup={handleSignup} />
      </div>
    );
  }

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
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-900/8 bg-white/82 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/82">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowWorkoutHelper(true)}
                className="rounded-2xl px-1 py-1 text-left transition hover:opacity-85"
                title="Open AI workout help"
              >
                <MotionH1
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-display text-xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-2xl"
                >
                  Gymify
                </MotionH1>
              </button>
              <span className="hidden rounded-full border border-slate-900/8 bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:inline-flex">
                {currentMonthLabel}
              </span>
              {selectedProfile && (
                <span className="hidden rounded-full border border-slate-900/8 bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 md:inline-flex">
                  {selectedProfile.emoji} {activeUser}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`hidden rounded-full px-3 py-1 text-xs font-semibold md:inline-flex ${
                  cloudSyncEnabled
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                }`}
              >
                {cloudSyncEnabled ? "Cloud sync" : "Local only"}
              </span>

              <button
                onClick={() => setActiveTab("profile")}
                className={`rounded-full border px-3 py-2 text-xs font-semibold shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition ${
                  activeTab === "profile"
                    ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-900/8 bg-white/80 text-slate-600 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                }`}
              >
                👤 Profile
              </button>

              <button
                onClick={() => setSelectedUser("")}
                className="hidden rounded-full border border-slate-900/8 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 sm:inline-flex"
              >
                Switch profile
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-full border border-slate-900/8 bg-white/80 p-2.5 text-lg shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                title="Toggle dark mode"
              >
                <MotionSpan
                  key={darkMode ? "moon" : "sun"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  className="block"
                >
                  {darkMode ? "☀️" : "🌗"}
                </MotionSpan>
              </button>
            </div>
          </div>

          <nav className="mt-4 hidden rounded-full border border-slate-900/8 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5 sm:flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
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
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-5xl flex-col gap-5 px-4 py-5 pb-28 md:pb-10">
        <section className="rounded-[28px] border border-white/55 bg-white/82 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/72">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Calendar Attendance
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">
                Simple shared attendance tracking for your group
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Track attendance day by day on a real calendar, while meals and leaderboard stats
                stay synced for everyone who has signed up.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:w-auto">
              <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today</p>
                <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                  {todayCheckIns}/{users.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">checked in</p>
              </div>
              <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">This month</p>
                <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                  {totalMonthlyAttendance}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">attendance marks</p>
              </div>
              <div className="rounded-2xl border border-slate-900/8 bg-slate-900/4 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Meals</p>
                <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
                  {todayMealLogs}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">meals logged today</p>
              </div>
            </div>
          </div>
        </section>

        {activeTab === "dashboard" ? (
          <section className="grid grid-cols-1 gap-4">
            <UserCard
              key={activeUser}
              userData={data[activeUser]}
              darkMode={darkMode}
              onUpdate={(newData) => handleUserUpdate(activeUser, newData)}
              onStreakMilestone={(streak) => handleStreakMilestone(activeUser, streak)}
            />
          </section>
        ) : (
          <section className="grid gap-5">
            {activeTab === "meals" ? (
              <MealsFeed activeUser={activeUser} data={visibleData} />
            ) : activeTab === "profile" ? (
              <ProfileSection
                key={activeUser}
                userData={data[activeUser]}
                onDeleteProfile={handleDeleteProfile}
                onSaveProfile={(updatedUserData) => handleUserUpdate(activeUser, updatedUserData)}
              />
            ) : (
              <Leaderboard data={visibleData} darkMode={darkMode} />
            )}
          </section>
        )}
      </main>

      <nav className="fixed inset-x-4 bottom-4 z-40 flex rounded-full border border-slate-900/10 bg-white/90 p-1.5 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 sm:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
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

      <button
        onClick={() => setSelectedUser("")}
        className="fixed bottom-24 right-4 z-30 rounded-full border border-slate-900/10 bg-white/92 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_20px_50px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/92 dark:text-slate-200 sm:hidden"
      >
        Switch
      </button>

      {streakPopup && (
        <StreakPopup
          show={!!streakPopup}
          streak={streakPopup.streak}
          userName={streakPopup.name}
          onClose={closeStreakPopup}
        />
      )}

      <WorkoutHelperModal open={showWorkoutHelper} onClose={() => setShowWorkoutHelper(false)} />
    </div>
  );
}
