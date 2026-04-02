import { useState } from "react";
import { motion } from "framer-motion";

const MotionSection = motion.section;

const activityOptions = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Lightly active" },
  { value: "moderate", label: "Moderately active" },
  { value: "active", label: "Very active" },
  { value: "athlete", label: "Athlete" },
];

export default function ProfileLogin({ existingUsers, onLogin, onSignup }) {
  const [mode, setMode] = useState(existingUsers.length > 0 ? "login" : "signup");
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupState, setSignupState] = useState({
    name: "",
    password: "",
    age: "",
    heightCm: "",
    weightKg: "",
    sex: "",
    activity: "moderate",
  });
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    const result = onLogin({
      name: loginName.trim(),
      password: loginPassword,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
  };

  const handleSignup = (event) => {
    event.preventDefault();
    const result = onSignup({
      ...signupState,
      name: signupState.name.trim(),
      password: signupState.password.trim(),
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
  };

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
            Sign in or create your fitness profile
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">
            New users can sign up once with their details. After that, they just sign in with
            their name and password.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl">
          <div className="mx-auto mb-6 flex max-w-md rounded-full border border-slate-900/8 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5">
            {[
              { id: "login", label: "Sign In" },
              { id: "signup", label: "Sign Up" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setMode(tab.id);
                  setError("");
                }}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  mode === tab.id
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : "text-slate-500 dark:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <form
              onSubmit={handleLogin}
              className="rounded-[28px] border border-white/55 bg-white/78 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            >
              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Username
                  </label>
                  <input
                    type="text"
                    value={loginName}
                    onChange={(event) => {
                      setLoginName(event.target.value);
                      setError("");
                    }}
                    list="existing-users"
                    placeholder="Enter your username"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <datalist id="existing-users">
                    {existingUsers.map((user) => (
                      <option key={user} value={user} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(event) => {
                      setLoginPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {existingUsers.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No users found yet. Create the first account with Sign Up.
                  </p>
                )}

                {error && <p className="text-sm font-medium text-rose-600 dark:text-rose-300">{error}</p>}

                <button
                  type="submit"
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-white dark:text-slate-950"
                >
                  Open dashboard
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleSignup}
              className="rounded-[28px] border border-white/55 bg-white/78 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Username
                  </label>
                  <input
                    type="text"
                    value={signupState.name}
                    onChange={(event) => {
                      setSignupState((current) => ({ ...current, name: event.target.value }));
                      setError("");
                    }}
                    placeholder="Choose a username"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={signupState.password}
                    onChange={(event) => {
                      setSignupState((current) => ({ ...current, password: event.target.value }));
                      setError("");
                    }}
                    placeholder="Create a password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Age
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={signupState.age}
                    onChange={(event) =>
                      setSignupState((current) => ({ ...current, age: event.target.value }))
                    }
                    placeholder="Age"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Sex
                  </label>
                  <select
                    value={signupState.sex}
                    onChange={(event) =>
                      setSignupState((current) => ({ ...current, sex: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Select sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={signupState.heightCm}
                    onChange={(event) =>
                      setSignupState((current) => ({ ...current, heightCm: event.target.value }))
                    }
                    placeholder="Height in cm"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={signupState.weightKg}
                    onChange={(event) =>
                      setSignupState((current) => ({ ...current, weightKg: event.target.value }))
                    }
                    placeholder="Weight in kg"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Activity level
                  </label>
                  <select
                    value={signupState.activity}
                    onChange={(event) =>
                      setSignupState((current) => ({ ...current, activity: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {activityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="mt-4 text-sm font-medium text-rose-600 dark:text-rose-300">{error}</p>}

              <button
                type="submit"
                className="mt-5 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-white dark:text-slate-950"
              >
                Create account
              </button>
            </form>
          )}
        </div>
      </div>
    </MotionSection>
  );
}
