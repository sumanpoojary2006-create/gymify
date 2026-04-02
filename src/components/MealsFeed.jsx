import { useMemo, useState } from "react";
import { getMealEntriesForDate, getTodayStr } from "../utils/storage";
import { getUserProfile } from "../data/userProfiles";

export default function MealsFeed({ activeUser, data }) {
  const [selectedDate, setSelectedDate] = useState(getTodayStr);

  const groupedMeals = useMemo(() => {
    const entries = getMealEntriesForDate(data, selectedDate, activeUser);
    const grouped = new Map();

    for (const meal of entries) {
      if (!grouped.has(meal.userName)) {
        grouped.set(meal.userName, []);
      }
      grouped.get(meal.userName).push(meal);
    }

    return Array.from(grouped.entries()).map(([userName, meals]) => ({
      userName,
      meals,
      profile: getUserProfile(userName),
    }));
  }, [activeUser, data, selectedDate]);

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
            Browse the group meal log by profile for any day, including shared meal photos.
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

      {groupedMeals.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
            No meals logged by others on this day yet.
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Once someone logs a text meal or adds a photo, it will show up here under their profile.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groupedMeals.map((group) => (
            <section
              key={group.userName}
              className="overflow-hidden rounded-[26px] border border-slate-900/8 bg-white/78 shadow-[0_12px_32px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/6"
            >
              <div className={`bg-gradient-to-r ${group.profile.gradient} p-4 text-white`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm">
                    {group.profile.emoji}
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{group.userName}</p>
                    <p className="text-sm text-white/75">
                      {group.meals.length} meal{group.meals.length === 1 ? "" : "s"} logged
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div className="overflow-hidden rounded-[22px] border border-slate-900/8 dark:border-white/10">
                  <div className="grid grid-cols-[minmax(0,1.6fr)_auto_auto] gap-3 bg-slate-900/5 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    <span>Meal</span>
                    <span>Cal</span>
                    <span>Type</span>
                  </div>

                  {group.meals.map((meal) => (
                    <div
                      key={`${group.userName}-${meal.timestamp || meal.index}-${meal.dish}`}
                      className="border-t border-slate-900/8 bg-slate-50/70 dark:border-white/10 dark:bg-slate-900/35"
                    >
                      <div className="grid grid-cols-[minmax(0,1.6fr)_auto_auto] gap-3 px-4 py-3 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900 dark:text-white">{meal.dish}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            {meal.time && <span>{meal.time}</span>}
                            {meal.userNote && <span className="truncate max-w-[180px]">Note: {meal.userNote}</span>}
                          </div>
                        </div>

                        <span className="font-semibold text-slate-950 dark:text-white">{meal.calories}</span>

                        <div className="flex flex-wrap justify-end gap-2">
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

                      {meal.photoDataUrl && (
                        <div className="px-4 pb-4">
                          <img
                            src={meal.photoDataUrl}
                            alt={meal.dish}
                            className="h-40 w-full rounded-2xl object-cover sm:h-48"
                          />
                        </div>
                      )}

                      {meal.notes.length > 0 && (
                        <div className="px-4 pb-4">
                          <div className="rounded-2xl border border-slate-900/8 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                              AI notes
                            </p>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                              {meal.notes.join(" ")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
