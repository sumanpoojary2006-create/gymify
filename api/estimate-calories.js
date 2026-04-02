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

function buildInput(meal, userNotes) {
  return [
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
  ];
}

async function requestEstimate({ apiKey, meal, model, userNotes }) {
  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: buildInput(meal, userNotes),
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
    throw new Error(payload?.error?.message || "OpenAI request failed.");
  }

  const text = getResponseText(payload);
  if (!text) {
    throw new Error("OpenAI returned an empty response.");
  }

  return normalizeEstimate(JSON.parse(text));
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
  const userNotes = requestBody?.userNotes?.trim() || "";

  if (!meal) {
    return response.status(400).json({ error: "Meal text is required." });
  }

  const configuredModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const modelCandidates = [...new Set([configuredModel, "gpt-4o-mini", "gpt-4.1-mini"])];

  try {
    for (const model of modelCandidates) {
      const estimate = await requestEstimate({
        apiKey,
        meal,
        model,
        userNotes,
      });
      return response.status(200).json(estimate);
    }
    throw new Error("OpenAI did not return a calorie estimate.");
  } catch (error) {
    return response.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected calorie estimation error.",
    });
  }
}
