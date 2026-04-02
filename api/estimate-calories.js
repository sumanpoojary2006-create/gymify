const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  required: ["meal", "total", "confidence", "breakdown", "notes"],
  properties: {
    meal: { type: "string" },
    total: { type: "integer" },
    confidence: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    breakdown: {
      type: "array",
      items: {
        type: "object",
        required: ["item", "quantity", "unit", "estimatedCalories", "reasoning"],
        properties: {
          item: { type: "string" },
          quantity: { type: "number" },
          unit: { type: "string" },
          estimatedCalories: { type: "integer" },
          reasoning: { type: "string" },
        },
      },
    },
    notes: {
      type: "array",
      items: { type: "string" },
    },
  },
};

function parsePhoto(photoBase64) {
  if (!photoBase64) {
    return null;
  }

  const match = photoBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Unsupported image format. Please upload a JPG or PNG photo.");
  }

  return {
    mime_type: match[1],
    data: match[2],
  };
}

function buildGeminiParts(meal, userNotes, photoBase64) {
  const imagePart = parsePhoto(photoBase64);

  return [
    {
      text:
        "Estimate the calories for this meal and return only JSON. " +
        (meal ? `Meal description: ${meal}. ` : "") +
        (userNotes ? `Extra notes: ${userNotes}. ` : "") +
        "Use the image as supporting context if attached. " +
        "Be practical with common Indian and international serving sizes. " +
        "Always fill the meal field with a short meal label.",
    },
    ...(imagePart ? [{ inline_data: imagePart }] : []),
  ];
}

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  const textPart = parts.find((part) => typeof part.text === "string" && part.text.trim());
  return textPart?.text || "";
}

function normalizeEstimate(result) {
  const breakdown = Array.isArray(result?.breakdown)
    ? result.breakdown.map((item) => ({
        item: item.item,
        quantity: Number(item.quantity) || 1,
        caloriesPerServing: Number(item.estimatedCalories) || 0,
        total: Number(item.estimatedCalories) || 0,
        estimated: true,
        unit: item.unit,
        reasoning: item.reasoning,
      }))
    : [];

  const totalFromBreakdown = breakdown.reduce((sum, item) => sum + item.total, 0);
  const total = Number.isFinite(Number(result?.total))
    ? Number(result.total)
    : totalFromBreakdown;

  return {
    meal: result?.meal || "",
    total,
    confidence: result?.confidence || "medium",
    breakdown,
    notes: Array.isArray(result?.notes) ? result.notes : [],
  };
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
    typeof request.body === "string"
      ? JSON.parse(request.body || "{}")
      : request.body || {};

  const meal = body?.meal?.trim() || "";
  const userNotes = body?.userNotes?.trim() || "";
  const photoBase64 = body?.photoBase64?.trim() || "";

  if (!meal && !photoBase64) {
    return response.status(400).json({ error: "Provide a meal description or photo." });
  }

  const configuredModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const modelCandidates = [...new Set([configuredModel, "gemini-2.5-flash", "gemini-2.0-flash"])];

  try {
    for (const model of modelCandidates) {
      try {
        const geminiResponse = await fetch(
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
                  parts: buildGeminiParts(meal, userNotes, photoBase64),
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: GEMINI_RESPONSE_SCHEMA,
              },
            }),
          }
        );

        const payload = await geminiResponse.json();
        if (!geminiResponse.ok) {
          throw new Error(payload?.error?.message || "Gemini request failed.");
        }

        const text = extractGeminiText(payload);
        if (!text) {
          throw new Error("Gemini returned an empty response.");
        }

        const parsed = JSON.parse(text);
        const estimate = normalizeEstimate(parsed);
        return response.status(200).json(estimate);
      } catch (error) {
        if (model === modelCandidates[modelCandidates.length - 1]) {
          throw error;
        }
      }
    }
    throw new Error("Gemini did not return a calorie estimate.");
  } catch (error) {
    console.error("Calorie estimation error:", error);
    return response.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Unexpected Gemini calorie estimation error.",
    });
  }
}
