export async function estimateCaloriesWithAI({ meal = "", imageDataUrl = "", userNotes = "" }) {
  const response = await fetch("/api/estimate-calories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ meal, imageDataUrl, userNotes }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || "AI calorie estimation failed.");
  }

  return {
    ...payload,
    source: "ai",
  };
}
