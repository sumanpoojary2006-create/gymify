import { useMemo, useState } from "react";
import { getMealEntriesForDate, getTodayStr } from "../utils/storage";
import { getUserProfile } from "../data/userProfiles";

export default function MealsFeed({ activeUser, data }) {
  const [selectedDate, setSelectedDate] = useState(getTodayStr);

  const meals = useMemo(
    () => getMealEntriesForDate(data, selectedDate, activeUser),
    [activeUser, data, selectedDate]
  );

  return (
    <section className="rounded-[30px] border border-white/50 bg-white/74 p-5 shadow-[0_28px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Meals
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950 dark:text-white">
            What everyone else ate
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Browse the group meal log for any day, including photo meals and text entries.
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          Pick a day
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </label>
      </div>

      {meals.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
            No meals logged by others on this day yet.
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Once someone logs a text meal or a photo meal, it will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {meals.map((meal) => {
            const profile = getUserProfile(meal.userName);

            return (
              <article
                key={`${meal.userName}-${meal.timestamp || meal.index}-${meal.dish}`}
                className="overflow-hidden rounded-[24px] border border-slate-900/8 bg-white/78 shadow-[0_12px_32px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/6"
              >
                {meal.photoDataUrl && (
                  <img
                    src={meal.photoDataUrl}
                    alt={meal.dish}
                    className="h-48 w-full object-cover sm:h-56"
                  />
                )}

                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${profile.gradient} text-2xl text-white shadow-[0_10px_24px_rgba(15,23,42,0.14)]`}
                      >
                        {profile.emoji}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-950 dark:text-white">
                          {meal.userName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{meal.time || "Meal log"}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-950 dark:text-white">
                        {meal.calories} cal
                      </p>
                      <div className="mt-1 flex flex-wrap justify-end gap-2">
                        <span className="rounded-full bg-slate-900/6 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:bg-white/10 dark:text-slate-300">
                          {meal.source === "ai" ? "AI" : "Local"}
                        </span>
                        {meal.usedPhoto && (
                          <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-300">
                            Photo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{meal.dish}</h3>
                    {meal.userNote && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Note: {meal.userNote}
                      </p>
                    )}
                  </div>

                  {meal.notes.length > 0 && (
                    <div className="rounded-2xl border border-slate-900/8 bg-slate-50/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        AI notes
                      </p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {meal.notes.join(" ")}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
