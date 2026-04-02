const STORAGE_KEY = "lean-challenge-60day";

const USERS = ["Suman", "Adhiraj", "Sitara"];
const TOTAL_DAYS = 60;
const START_DATE = "2026-04-02"; // Challenge start date

function getDefaultUserData(name) {
  return {
    name,
    gymDays: {},       // { "2026-04-02": true, ... }
    weights: {},       // { "2026-04-02": 75.5, ... }
    calories: {},      // { "2026-04-02": [{ dish: "...", calories: 120, time: "..." }] }
    bodyProfile: {
      age: "",
      heightCm: "",
      weightKg: "",
      sex: "",
      activity: "moderate",
    },
    badges: [],
  };
}

export function getStartDate() {
  return START_DATE;
}

export function getTotalDays() {
  return TOTAL_DAYS;
}

export function getUserNames() {
  return USERS;
}

export function createDefaultData() {
  const data = {};
  for (const name of USERS) {
    data[name] = getDefaultUserData(name);
  }
  return data;
}

function normalizeUserData(name, userData = {}) {
  return {
    ...getDefaultUserData(name),
    ...userData,
    gymDays: userData.gymDays || {},
    weights: userData.weights || {},
    calories: userData.calories || {},
    bodyProfile: {
      ...getDefaultUserData(name).bodyProfile,
      ...(userData.bodyProfile || {}),
    },
    badges: Array.isArray(userData.badges) ? userData.badges : [],
  };
}

export function normalizeData(rawData) {
  if (!rawData || typeof rawData !== "object") {
    return createDefaultData();
  }

  const data = {};
  for (const name of USERS) {
    data[name] = normalizeUserData(name, rawData[name]);
  }
  return data;
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return normalizeData(JSON.parse(raw));
    }
  } catch (e) {
    console.error("Failed to load data:", e);
  }

  return createDefaultData();
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data:", e);
  }
}

export function getDayNumber(dateStr) {
  const start = new Date(START_DATE);
  const current = new Date(dateStr);
  const diff = Math.floor((current - start) / (1000 * 60 * 60 * 24));
  return diff + 1; // Day 1 = start date
}

export function getDateForDay(dayNumber) {
  const start = new Date(START_DATE);
  start.setDate(start.getDate() + dayNumber - 1);
  return start.toISOString().split("T")[0];
}

export function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export function getCurrentDayNumber() {
  return getDayNumber(getTodayStr());
}

export function getRecentDateStrings(days, fromDate = new Date()) {
  const dates = [];
  const anchor = new Date(fromDate);

  for (let index = days - 1; index >= 0; index -= 1) {
    const current = new Date(anchor);
    current.setDate(anchor.getDate() - index);
    dates.push(current.toISOString().split("T")[0]);
  }

  return dates;
}

export function countTruthyDates(record, dateStrings) {
  return dateStrings.filter((dateStr) => !!record?.[dateStr]).length;
}

export function countLoggedCalorieDays(calories, dateStrings) {
  return dateStrings.filter((dateStr) => (calories?.[dateStr] || []).length > 0).length;
}

export function calculateStreak(gymDays) {
  const today = getTodayStr();
  let streak = 0;
  let date = new Date(today);

  while (true) {
    const dateStr = date.toISOString().split("T")[0];
    if (gymDays[dateStr]) {
      streak++;
      date.setDate(date.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function getTodayCalories(calorieEntries) {
  const today = getTodayStr();
  const entries = calorieEntries[today] || [];
  return entries.reduce((sum, e) => sum + (e.calories || 0), 0);
}

export function getLatestWeight(weights) {
  const dates = Object.keys(weights).sort();
  if (dates.length === 0) return null;
  return { date: dates[dates.length - 1], weight: weights[dates[dates.length - 1]] };
}

export function getLeaderboardScore(userData) {
  const totalGymDays = Object.values(userData.gymDays || {}).filter(Boolean).length;
  const streak = calculateStreak(userData.gymDays || {});
  return totalGymDays * 10 + streak;
}

export function getActivityMultiplier(activity) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  };

  return multipliers[activity] || multipliers.moderate;
}

export function calculateTdee({ activity, age, heightCm, sex, weightKg }) {
  const parsedAge = Number(age);
  const parsedHeight = Number(heightCm);
  const parsedWeight = Number(weightKg);

  if (!parsedAge || !parsedHeight || !parsedWeight || !sex) {
    return null;
  }

  const baseBmr =
    10 * parsedWeight +
    6.25 * parsedHeight -
    5 * parsedAge +
    (sex === "male" ? 5 : -161);

  const tdee = baseBmr * getActivityMultiplier(activity);

  return {
    bmr: Math.round(baseBmr),
    tdee: Math.round(tdee),
  };
}

// Badge logic
export function computeBadges(userData) {
  const badges = [];
  const streak = calculateStreak(userData.gymDays);
  const totalGymDays = Object.values(userData.gymDays).filter(Boolean).length;
  const totalCalorieDays = Object.keys(userData.calories).length;

  if (streak >= 7) badges.push({ id: "7day", label: "7-Day Warrior", icon: "⚔️" });
  if (streak >= 14) badges.push({ id: "14day", label: "Two Week Titan", icon: "🏆" });
  if (streak >= 30) badges.push({ id: "30day", label: "30-Day Legend", icon: "🌟" });
  if (totalGymDays >= 45) badges.push({ id: "consistency", label: "Consistency King", icon: "👑" });
  if (totalCalorieDays >= 14) badges.push({ id: "calorie", label: "Calorie Master", icon: "🔥" });
  if (totalGymDays >= 10) badges.push({ id: "dedicated", label: "Dedicated", icon: "💪" });

  const weightDates = Object.keys(userData.weights).sort();
  if (weightDates.length >= 2) {
    const first = userData.weights[weightDates[0]];
    const last = userData.weights[weightDates[weightDates.length - 1]];
    if (last < first) badges.push({ id: "weightloss", label: "Weight Crusher", icon: "📉" });
  }

  return badges;
}
