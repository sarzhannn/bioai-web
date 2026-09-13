import { SOURCE_REVIEW_PROMPT } from "../lib/prompts.js";

const MODEL = "gemini-2.5-flash";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const { category, url: sourceUrl, text: sourceText } = req.body || {};
    const parts = [{ text: `Категория: ${category === "plant" ? "растение" : "животное"}.` }];
    if (sourceUrl) parts.push({ text: `Ссылка на источник: ${sourceUrl}` });
    if (sourceText) parts.push({ text: `Текст/выдержка от пользователя: ${sourceText}` });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SOURCE_REVIEW_PROMPT }] },
        contents: [{ role: "user", parts }],
        // "google_search" — встроенный в Gemini инструмент веб-поиска (grounding),
        // позволяет модели реально проверить сайт, а не гадать по названию домена.
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.3 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "gemini_api_error", detail: errText });
    }

    const data = await response.json();
    const textOut = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "";
    const cleaned = textOut.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: "review_failed", message: String(e) });
  }
}
