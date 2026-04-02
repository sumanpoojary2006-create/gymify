const WORKOUT_RESPONSE_SCHEMA = {
  type: "object",
  required: ["title", "overview", "focus", "warmup", "exercises", "finisher", "coachNotes"],
  properties: {
    title: { type: "string" },
    overview: { type: "string" },
    focus: { type: "string" },
    warmup: {
      type: "array",
      items: { type: "string" },
    },
    exercises: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "sets", "reps", "rest", "notes"],
        properties: {
          name: { type: "string" },
          sets: { type: "string" },
          reps: { type: "string" },
          rest: { type: "string" },
          notes: { type: "string" },
        },
      },
    },
    finisher: { type: "string" },
    coachNotes: {
      type: "array",
      items: { type: "string" },
    },
  },
};

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  const textPart = parts.find((part) => typeof part.text === "string" && part.text.trim());
  return textPart?.text || "";
}

async function requestWorkoutPlan({ apiKey, model, split, workoutCount }) {
  const splitLabel = split === "weight-loss" ? "weight loss training" : split;
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  `Create a practical ${splitLabel} workout plan with exactly ${workoutCount} exercises. ` +
                  "Return only JSON. Make it gym-friendly, balanced, and easy to follow for a general fitness user. " +
                  "Structure it like a coach-made session. " +
                  "Include a short overview, a clear focus label, a short warm-up, sets/reps/rest for each exercise, one finisher, and a few short coach notes. " +
                  "If the split is weight loss training, make it fat-loss friendly with simple strength plus conditioning choices.",
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: WORKOUT_RESPONSE_SCHEMA,
        },
      }),
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Gemini workout helper failed.");
  }

  const text = extractGeminiText(payload);
  if (!text) {
    throw new Error("Gemini returned an empty workout plan.");
  }

  return JSON.parse(text);
}

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(503).json({
      error: "Gemini API key is not configured. Add GEMINI_API_KEY to your environment variables.",
    });
  }

  const body =
    typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  const split = body?.split?.trim()?.toLowerCase() || "";
  const workoutCount = Number(body?.workoutCount);

  if (!["push", "pull", "legs", "weight-loss"].includes(split)) {
    return response.status(400).json({ error: "Choose Push, Pull, Legs, or Weight loss training." });
  }

  if (!Number.isFinite(workoutCount) || workoutCount < 3 || workoutCount > 10) {
    return response.status(400).json({ error: "Choose a valid number of workouts." });
  }

  const configuredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const modelCandidates = [...new Set([configuredModel, "gemini-2.5-flash", "gemini-2.0-flash"])];

  try {
    for (const model of modelCandidates) {
      try {
        const plan = await requestWorkoutPlan({
          apiKey,
          model,
          split,
          workoutCount,
        });
        return response.status(200).json(plan);
      } catch (error) {
        if (model === modelCandidates[modelCandidates.length - 1]) {
          throw error;
        }
      }
    }

    throw new Error("Gemini did not return a workout plan.");
  } catch (error) {
    return response.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected workout helper error.",
    });
  }
}
