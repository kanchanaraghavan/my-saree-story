export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { sarees, occasion, season, mood } = req.body;
  const prompt = `You are a warm saree stylist. From this collection:\n${JSON.stringify(sarees)}\n\nOccasion: ${occasion || "any"}\nSeason: ${season || "any"}\nMood: ${mood || "any"}\n\nRecommend exactly 3 sarees. Be warm and personal. Respond ONLY with a valid JSON array (no markdown):\n[{"id":"...","reason":"2-3 warm sentences","stylingTip":"jewellery/blouse tip"}]`;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1100,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = data.content?.find(b => b.type === "text")?.text || "[]";
    const picks = JSON.parse(text.replace(/```json|```/g, "").trim());
    return res.status(200).json({ picks });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
