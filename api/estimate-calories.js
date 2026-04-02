const CALORIE_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["meal", "total", "confidence", "breakdown", "notes"],
  properties: {
    meal: {
      type: "string",
    },
    total: {
      type: "integer",
      minimum: 0,
    },
    confidence: {
      type: "string",
      enum: ["low", "medium", "high"],
    },
    breakdown: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["item", "quantity", "unit", "estimatedCalories", "reasoning"],
        properties: {
          item: {
            type: "string",
          },
          quantity: {
            type: "number",
          },
          unit: {
            type: "string",
          },
          estimatedCalories: {
            type: "integer",
            minimum: 0,
          },
          reasoning: {
            type: "string",
          },
        },
      },
    },
    notes: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
};

function parseImageDataUrl(imageDataUrl) {
  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Unsupported image format. Please try a JPG or PNG photo.");
  }

  return {
    mimeType: match[1],
    base64: match[2],
  };
}

async function uploadVisionFile({ apiKey, imageDataUrl }) {
  const { mimeType, base64 } = parseImageDataUrl(imageDataUrl);
  const buffer = Buffer.from(base64, "base64");
  const extension = mimeType.includes("png")
    ? "png"
    : mimeType.includes("webp")
      ? "webp"
      : "jpg";

  const formData = new FormData();
  formData.append("purpose", "vision");
  formData.append("file", new Blob([buffer], { type: mimeType }), `meal.${extension}`);

  const fileResponse = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const filePayload = await fileResponse.json();
  if (!fileResponse.ok) {
    throw new Error(filePayload?.error?.message || "Photo upload failed.");
  }

  return filePayload.id;
}

function getResponseText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const message = payload?.output?.find((item) => item.type === "message");
  const textItem = message?.content?.find(
    (item) =>
      (item.type === "output_text" || item.type === "text") &&
      typeof item.text === "string" &&
      item.text.trim(),
  );

  return textItem?.text || "";
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
  const total = Number.isFinite(Number(result?.total)) ? Number(result.total) : totalFromBreakdown;

  return {
    meal: result?.meal || "",
    total,
    confidence: result?.confidence || "medium",
    breakdown,
    notes: Array.isArray(result?.notes) ? result.notes : [],
  };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return response.status(503).json({ error: "OpenAI API key is not configured." });
  }

  const requestBody =
    typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  const meal = requestBody?.meal?.trim() || "";
  const imageDataUrl = requestBody?.imageDataUrl?.trim() || "";
  const userNotes = requestBody?.userNotes?.trim() || "";

  if (!meal && !imageDataUrl) {
    return response.status(400).json({ error: "Meal text or photo is required." });
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  try {
    const uploadedFileId = imageDataUrl
      ? await uploadVisionFile({ apiKey, imageDataUrl })
      : null;

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You estimate meal calories for a fitness tracking app. Return structured JSON only. " +
                  "Be practical, conservative, and use common Indian and international serving assumptions when portions are unclear. " +
                  "If the meal description is ambiguous, mention that in notes and lower confidence.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Estimate the calories for this meal. " +
                  (meal ? `User note: ${meal}. ` : "") +
                  (userNotes ? `Additional notes: ${userNotes}. ` : "") +
                  "If the image is unclear, say so in notes and lower confidence. " +
                  "Always give a short meal label in the meal field.",
              },
              ...(meal
                ? [
                    {
                      type: "input_text",
                      text: `Meal description: ${meal}`,
                    },
                  ]
                : []),
              ...(imageDataUrl
                ? [
                    {
                      type: "input_image",
                      file_id: uploadedFileId,
                      detail: "low",
                    },
                  ]
                : []),
              ...(userNotes
                ? [
                    {
                      type: "input_text",
                      text: `Extra meal notes: ${userNotes}`,
                    },
                  ]
                : []),
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "meal_calorie_estimate",
            schema: CALORIE_RESPONSE_SCHEMA,
            strict: true,
          },
        },
      }),
    });

    const payload = await openAiResponse.json();
    if (!openAiResponse.ok) {
      return response.status(openAiResponse.status).json({
        error: payload?.error?.message || "OpenAI request failed.",
      });
    }

    const text = getResponseText(payload);
    if (!text) {
      return response.status(502).json({ error: "OpenAI returned an empty response." });
    }

    const parsed = JSON.parse(text);
    const estimate = normalizeEstimate(parsed);
    return response.status(200).json(estimate);
  } catch (error) {
    return response.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected calorie estimation error.",
    });
  }
}
