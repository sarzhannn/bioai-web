import { buildSystemPrompt } from "../lib/prompts.js";

// Актуальная бесплатная модель Google Gemini (gemini-2.5-flash устарела и
// больше не выдаётся новым пользователям). Если снова появится сообщение
// вида "model no longer available" — смотри в тексте ошибки, на что
// заменить, Google периодически обновляет линейку моделей.
const MODEL = "gemini-3.6-flash";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const { category, symptoms, extra, lang, imageBase64, imageMediaType, customEntries } = req.body || {};
    const safeLang = lang === "kz" ? "kz" : "ru";

    const parts = [];
    if (imageBase64) {
      parts.push({ inlineData: { mimeType: imageMediaType || "image/jpeg", data: imageBase64 } });
    }
    const textParts = [`Категория: ${category === "plant" ? "растение" : "животное"}.`];
    if (symptoms) textParts.push(`Описание симптомов/внешнего вида: ${symptoms}`);
    if (extra) textParts.push(`Дополнительные условия: ${extra}`);
    if (!imageBase64) textParts.push("Фото не предоставлено, анализируй только по тексту.");
    parts.push({ text: textParts.join("\n") });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: buildSystemPrompt(customEntries, safeLang) }] },
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "gemini_api_error", detail: errText });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: "analysis_failed", message: String(e) });
  }
}
