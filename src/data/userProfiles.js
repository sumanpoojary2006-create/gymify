const userProfiles = {
  Suman: {
    emoji: "⚡",
    title: "Momentum Maker",
    goal: "Build an unstoppable training rhythm.",
    mantra: "Protect the streak and push the pace.",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    softGradient: "from-amber-500/18 via-orange-500/14 to-rose-500/10",
    accentText: "text-amber-100",
    border: "border-amber-300/35",
    ringColors: ["#f59e0b", "#fb7185"],
    statTint: "bg-amber-500/12 text-amber-100",
  },
  Adhiraj: {
    emoji: "🌊",
    title: "Consistency Engine",
    goal: "Stack calm, repeatable wins every week.",
    mantra: "Small reps, big compounding.",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    softGradient: "from-emerald-500/18 via-teal-500/14 to-cyan-500/10",
    accentText: "text-emerald-100",
    border: "border-emerald-300/35",
    ringColors: ["#10b981", "#22d3ee"],
    statTint: "bg-emerald-500/12 text-emerald-100",
  },
  Sitara: {
    emoji: "✨",
    title: "Focus Finisher",
    goal: "Turn discipline into visible progress.",
    mantra: "Every clean day adds shine.",
    gradient: "from-fuchsia-500 via-rose-500 to-orange-400",
    softGradient: "from-fuchsia-500/18 via-rose-500/14 to-orange-400/10",
    accentText: "text-fuchsia-100",
    border: "border-fuchsia-300/35",
    ringColors: ["#d946ef", "#fb7185"],
    statTint: "bg-fuchsia-500/12 text-fuchsia-100",
  },
};

const fallbackProfile = {
  emoji: "🔥",
  title: "Challenge Contender",
  goal: "Show up and keep the streak alive.",
  mantra: "Progress loves consistency.",
  gradient: "from-sky-500 via-indigo-500 to-violet-500",
  softGradient: "from-sky-500/18 via-indigo-500/14 to-violet-500/10",
  accentText: "text-sky-100",
  border: "border-sky-300/35",
  ringColors: ["#38bdf8", "#8b5cf6"],
  statTint: "bg-sky-500/12 text-sky-100",
};

export function getUserProfile(name) {
  return userProfiles[name] || fallbackProfile;
}

export function getAllUserProfiles() {
  return userProfiles;
}
