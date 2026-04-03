import { useState } from "react";
import { motion } from "framer-motion";
import WeightChart from "./WeightChart";
import CalorieChart from "./CalorieChart";
import ProgressRing from "./ProgressRing";
import TdeeCalculator from "./TdeeCalculator";
import CalorieWarningPopup from "./CalorieWarningPopup";
import CalorieThresholdGraph from "./CalorieThresholdGraph";
import { getUserProfile } from "../data/userProfiles";
import { estimateCaloriesWithAI } from "../utils/calorieEstimator";
import {
  calculateBmi,
  getFatLossTargetMetrics,
  getLatestWeight,
  getMonthAttendanceSummary,
  getTodayCalories,
  getTodayStr,
} from "../utils/storage";

const MotionDiv = motion.div;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not process that image."));
    image.src = dataUrl;
  });
}

async function optimizeImageForUpload(file) {
  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);

  const maxDimension = 1280;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not prepare the photo for upload.");
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export default function UserCard({ userData, darkMode, onUpdate }) {
  const [weightInput, setWeightInput] = useState("");
  const [dishInput, setDishInput] = useState("");
  const [mealNotesInput, setMealNotesInput] = useState("");
  const [dishPhotoName, setDishPhotoName] = useState("");
  const [dishPhotoDataUrl, setDishPhotoDataUrl] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showHealthTools, setShowHealthTools] = useState(false);
  const [calorieResult, setCalorieResult] = useState(null);
  const [calorieNotice, setCalorieNotice] = useState(null);
  const [calorieWarning, setCalorieWarning] = useState(null);
  const [isEstimatingCalories, setIsEstimatingCalories] = useState(false);

  const { name, gymDays, weights, calories, bodyProfile } = userData;
  const profile = getUserProfile(name);
  const latestWeight = getLatestWeight(weights);
  const todayCalories = getTodayCalories(calories);
  const monthAttendance = getMonthAttendanceSummary(gymDays);
  const fatLossMetrics = getFatLossTargetMetrics({
    activity: bodyProfile.activity,
    age: bodyProfile.age,
    heightCm: bodyProfile.heightCm,
    sex: bodyProfile.sex,
    weightKg: latestWeight?.weight || bodyProfile.weightKg,
    intake: todayCalories,
  });

  const handleWeightSubmit = (event) => {
    event.preventDefault();
    const parsedWeight = parseFloat(weightInput);
    if (isNaN(parsedWeight) || parsedWeight <= 0) return;

    const today = getTodayStr();
    const bmiResult = calculateBmi({
      heightCm: bodyProfile.heightCm,
      weightKg: parsedWeight,
    });
    onUpdate({
      ...userData,
      bodyProfile: {
        ...bodyProfile,
        bmi: bmiResult?.bmi || bodyProfile.bmi || "",
        bmiCategory: bmiResult?.category || bodyProfile.bmiCategory || "",
      },
      weights: { ...weights, [today]: parsedWeight },
    });
    setWeightInput("");
  };

  const clearMealComposer = () => {
    setDishInput("");
    setMealNotesInput("");
    setDishPhotoName("");
    setDishPhotoDataUrl("");
  };

  const clearPhotoAttachment = () => {
    setDishPhotoName("");
    setDishPhotoDataUrl("");
  };

  const saveCalorieEntry = async ({
    imageDataUrl = dishPhotoDataUrl,
    mealText = dishInput.trim(),
    notesText = mealNotesInput.trim(),
  } = {}) => {
    const hasPhoto = Boolean(imageDataUrl);

    if ((!mealText && !imageDataUrl) || isEstimatingCalories) {
      return;
    }

    setIsEstimatingCalories(true);

    try {
      try {
        const result = await estimateCaloriesWithAI({
          meal: mealText,
          userNotes: notesText,
          photoBase64: hasPhoto ? imageDataUrl : "",
        });
        const sourceLabel = result.source === "ai" ? "AI" : "local database";
        const notice = {
          tone: "success",
          text: hasPhoto
            ? `${sourceLabel} estimated ${result.total} calories from your photo + description.`
            : `${sourceLabel} estimated ${result.total} calories.`,
        };

        const today = getTodayStr();
        const todayEntries = calories[today] || [];
        const newEntry = {
          dish: result.meal || mealText || "Meal",
          calories: result.total,
          breakdown: result.breakdown,
          source: result.source || "ai",
          confidence: result.confidence || "medium",
          notes: result.notes || [],
          userNote: notesText,
          usedPhoto: hasPhoto,
          photoDataUrl: hasPhoto ? imageDataUrl : "",
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
        };
        const updatedEntries = [...todayEntries, newEntry];
        const updatedIntake = updatedEntries.reduce((sum, entry) => sum + (entry.calories || 0), 0);
        const updatedMetrics = getFatLossTargetMetrics({
          activity: bodyProfile.activity,
          age: bodyProfile.age,
          heightCm: bodyProfile.heightCm,
          sex: bodyProfile.sex,
          weightKg: latestWeight?.weight || bodyProfile.weightKg,
          intake: updatedIntake,
        });

        setCalorieResult(result);
        setCalorieNotice(notice);
        onUpdate({
          ...userData,
          calories: { ...calories, [today]: updatedEntries },
        });

        if (updatedMetrics?.isOverTarget) {
          setCalorieWarning({
            tone: "danger",
            title: "Hold up on more food",
            message: `You are ${Math.abs(updatedMetrics.remainingCalories)} calories over today’s fat-loss cap.`,
          });
        } else if (updatedMetrics?.isCloseToTarget) {
          setCalorieWarning({
            tone: "warn",
            title: "You’re near your food limit",
            message: `${updatedMetrics.remainingCalories} calories left for today. Keep the next meal very light.`,
          });
        }

        clearMealComposer();
        setTimeout(() => {
          setCalorieResult(null);
          setCalorieNotice(null);
        }, 3500);
      } catch (error) {
        setCalorieResult(null);
        setCalorieNotice({
          tone: "fallback",
          text:
            error instanceof Error
              ? `AI verification failed, so this meal was not saved. ${error.message}`
              : "AI verification failed, so this meal was not saved.",
        });
      }
    } finally {
      setIsEstimatingCalories(false);
    }
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await optimizeImageForUpload(file);
      setDishPhotoDataUrl(dataUrl);
      setDishPhotoName(file.name);
      setCalorieNotice({
        tone: "success",
        text: "Photo attached. Calories will be calculated from the meal text when you submit.",
      });
    } catch {
      setCalorieNotice({
        tone: "fallback",
        text: "Could not read that photo. Please try another image.",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleDishSubmit = async (event) => {
    event.preventDefault();
    await saveCalorieEntry({
      imageDataUrl: dishPhotoDataUrl,
      mealText: dishInput.trim(),
      notesText: mealNotesInput.trim(),
    });
  };

  const handleDeleteMeal = (mealIndex) => {
    const today = getTodayStr();
    const nextEntries = (calories[today] || []).filter((_, index) => index !== mealIndex);
    const nextCalories = { ...calories };

    if (nextEntries.length > 0) {
      nextCalories[today] = nextEntries;
    } else {
      delete nextCalories[today];
    }

    onUpdate({
      ...userData,
      calories: nextCalories,
    });

    setCalorieNotice({
      tone: "success",
      text: "Meal deleted.",
    });
    setCalorieResult(null);
    setTimeout(() => setCalorieNotice(null), 2500);
  };

  const handleBodyProfileSave = (nextBodyProfile) => {
    const effectiveWeight = latestWeight?.weight || nextBodyProfile.weightKg;
    const bmiResult = calculateBmi({
      heightCm: nextBodyProfile.heightCm,
      weightKg: effectiveWeight,
    });

    onUpdate({
      ...userData,
      bodyProfile: {
        ...bodyProfile,
        ...nextBodyProfile,
        bmi: bmiResult?.bmi || bodyProfile.bmi || "",
        bmiCategory: bmiResult?.category || bodyProfile.bmiCategory || "",
      },
    });
  };

  const todayEntries = calories[getTodayStr()] || [];

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-[28px] border border-white/55 bg-white/82 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/72"
    >
      <div className={`bg-gradient-to-r ${profile.gradient} p-5 text-white`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm">
              {profile.emoji}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                {profile.title}
              </p>
              <h3 className="mt-1 text-2xl font-semibold">{name}</h3>
              <p className="mt-2 text-sm text-white/85">{profile.goal}</p>
            </div>
          </div>

          <ProgressRing
            progress={monthAttendance.attendanceRate}
            size={60}
            strokeWidth={5}
            colors={profile.ringColors}
            label={`${monthAttendance.attendanceRate}%`}
          />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <CalorieThresholdGraph current={todayCalories} target={fatLossMetrics?.targetIntake || 0} />

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full rounded-2xl border border-slate-900/8 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:border-white/10 dark:bg-white dark:text-slate-950"
        >
          {showDetails ? "Hide details ▲" : "Open details ▼"}
        </button>
      </div>

      {showDetails && (
        <MotionDiv
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="space-y-4 px-5 pb-5"
        >
          <div className="soft-panel rounded-[24px] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-semibold text-slate-950 dark:text-white">
                  Weight
                </h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Add the latest number and follow the trend.
                </p>
              </div>
              <span className="rounded-full border border-slate-900/8 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {latestWeight ? `${latestWeight.weight} kg` : "No data"}
              </span>
            </div>

            <form onSubmit={handleWeightSubmit} className="mb-3 flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="Today's weight (kg)"
                value={weightInput}
                onChange={(event) => setWeightInput(event.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 dark:bg-white dark:text-slate-950"
              >
                Save
              </button>
            </form>

            <WeightChart weights={weights} darkMode={darkMode} />
          </div>

          <div className="soft-panel rounded-[24px] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-semibold text-slate-950 dark:text-white">
                  Calories
                </h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Quick meal logging with a simple daily summary.
                </p>
              </div>
              <span className="rounded-full border border-slate-900/8 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {todayCalories} cal today
              </span>
            </div>

            <form onSubmit={handleDishSubmit} className="mb-3 space-y-3">
              <input
                type="text"
                placeholder='Meal name, e.g. "2 dosa and chutney"'
                value={dishInput}
                onChange={(event) => setDishInput(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

              <textarea
                rows="2"
                placeholder="Add notes (optional), e.g. homemade, extra oil, half plate"
                value={mealNotesInput}
                onChange={(event) => setMealNotesInput(event.target.value)}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-orange-300 bg-orange-50/70 px-4 py-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-200">
                  {dishPhotoName ? "Change photo" : "Add photo (optional)"}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>

                {dishPhotoDataUrl && (
                  <div className="space-y-3">
                    <img
                      src={dishPhotoDataUrl}
                      alt="Selected meal"
                      className="h-32 w-full rounded-2xl object-cover shadow-sm"
                    />

                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-900/8 bg-white/70 px-3 py-2 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      <span className="max-w-[180px] truncate">{dishPhotoName}</span>
                      <button
                        type="button"
                        onClick={clearPhotoAttachment}
                        className="font-semibold text-rose-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isEstimatingCalories || !dishInput.trim()}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isEstimatingCalories ? "Calculating..." : "Calculate cal"}
              </button>
            </form>

            {calorieNotice && (
              <MotionDiv
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-3 rounded-2xl border p-3 ${
                  calorieNotice?.tone === "fallback"
                    ? "border-amber-300/50 bg-amber-500/10"
                    : "border-emerald-300/40 bg-emerald-500/10"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    calorieNotice?.tone === "fallback"
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-emerald-700 dark:text-emerald-400"
                  }`}
                >
                  {calorieResult ? `+${calorieResult.total} calories added` : "Meal not saved"}
                </p>
                {calorieNotice && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{calorieNotice.text}</p>
                )}
              </MotionDiv>
            )}

            {todayEntries.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Today
                </p>
                <div className="mt-3 overflow-hidden rounded-[22px] border border-slate-900/8 dark:border-white/10">
                  <div className="grid grid-cols-[minmax(0,1.6fr)_auto_auto_auto] gap-3 bg-slate-900/5 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
                    <span>Meal</span>
                    <span>Cal</span>
                    <span>Type</span>
                    <span className="text-right">Action</span>
                  </div>
                  {todayEntries.map((entry, index) => (
                    <div
                      key={`${entry.timestamp || index}-${entry.dish}`}
                      className="grid grid-cols-[minmax(0,1.6fr)_auto_auto_auto] gap-3 border-t border-slate-900/8 bg-white/70 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/6"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-100">{entry.dish}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
                          {entry.time && (
                            <span className="text-slate-500 dark:text-slate-400">{entry.time}</span>
                          )}
                          {entry.usedPhoto && (
                            <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-600 dark:text-orange-300">
                              Photo
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="font-semibold text-orange-600 dark:text-orange-300">
                        {entry.calories}
                      </span>

                      <span className="rounded-full bg-slate-900/6 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-white/10 dark:text-slate-300">
                        {entry.source === "ai" ? "AI" : "Local"}
                      </span>

                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteMeal(index)}
                          className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-500/16 dark:text-rose-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <CalorieChart calories={calories} darkMode={darkMode} />
          </div>

          <div className="soft-panel rounded-[24px] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="font-display text-base font-semibold text-slate-950 dark:text-white">
                  Health tools
                </h4>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Open TDEE, BMI, and under-target analysis only when you need it.
                </p>
              </div>
              <button
                onClick={() => setShowHealthTools(!showHealthTools)}
                className="rounded-2xl border border-slate-900/8 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 dark:border-white/10 dark:bg-white dark:text-slate-950"
              >
                {showHealthTools ? "Hide" : "Open"}
              </button>
            </div>

            {showHealthTools && (
              <div className="mt-4">
                <TdeeCalculator
                  bodyProfile={bodyProfile}
                  latestWeight={latestWeight}
                  todayCalories={todayCalories}
                  onSaveBodyProfile={handleBodyProfileSave}
                />
              </div>
            )}
          </div>
        </MotionDiv>
      )}

      {calorieWarning && (
        <CalorieWarningPopup
          show={!!calorieWarning}
          title={calorieWarning.title}
          message={calorieWarning.message}
          tone={calorieWarning.tone}
          onClose={() => setCalorieWarning(null)}
        />
      )}
    </MotionDiv>
  );
}
