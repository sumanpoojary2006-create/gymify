export async function estimateCaloriesWithAI({
  meal = "",
  userNotes = "",
  photoBase64 = "",
} = {}) {
  const response = await fetch("/api/estimate-calories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      meal,
      userNotes,
      photoBase64: photoBase64 || undefined,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || "Gemini calorie estimation failed.");
  }

  return {
    ...payload,
    source: "ai",
  };
}
