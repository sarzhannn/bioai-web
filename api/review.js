import { buildReviewPrompt } from "../lib/prompts.js";

const MODEL = "gemini-3.6-flash";

async function callGemini(apiUrl, body) {
  return fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    const { category, url: sourceUrl, text: sourceText, lang } = req.body || {};
    const safeLang = lang === "kz" ? "kz" : "ru";
    const parts = [{ text: `Категория: ${category === "plant" ? "растение" : "животное"}.` }];
    if (sourceUrl) parts.push({ text: `Ссылка на источник: ${sourceUrl}` });
    if (sourceText) parts.push({ text: `Текст/выдержка от пользователя: ${sourceText}` });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const basePayload = {
      system_instruction: { parts: [{ text: buildReviewPrompt(safeLang) }] },
      contents: [{ role: "user", parts }],
      generationConfig: { temperature: 0.3 },
    };

    // Основная попытка — с включённым веб-поиском (grounding), чтобы ИИ
    // реально проверил сайт, а не гадал по названию домена.
    let response = await callGemini(apiUrl, {
      ...basePayload,
      tools: [{ google_search: {} }],
    });
    let grounded = true;

    // У google_search своя, отдельная от обычных RPM/TPM/RPD квота — она может
    // закончиться, даже когда лимит на саму модель ещё далеко не исчерпан.
    // В этом случае не проваливаем весь запрос, а пробуем ещё раз без
    // веб-поиска: пользователь должен получить хоть какой-то ответ.
    if (!response.ok) {
      response = await callGemini(apiUrl, basePayload);
      grounded = false;
    }

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "gemini_api_error", detail: errText });
    }

    const data = await response.json();
    const textOut = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n") || "";
    const cleaned = textOut.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    parsed.grounded = grounded;
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: "review_failed", message: String(e) });
  }
}
