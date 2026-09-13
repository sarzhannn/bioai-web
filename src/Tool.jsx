import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Leaf, PawPrint, Upload, Camera, Loader2, AlertTriangle, ChevronRight, Sprout, X,
  BookPlus, ShieldCheck, ShieldAlert, ShieldQuestion, Link2, Check, Trash2, Download, Search,
} from "lucide-react";
import { KNOWLEDGE_BASE, mergeKB } from "../lib/knowledgeBase.js";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// --- локальное хранилище в браузере (замена служебного window.storage из Claude) ---
function storageGet(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}
function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* best-effort */
  }
}

async function callAnalyze(payload) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("analyze request failed");
  return res.json();
}

async function callReview(payload) {
  const res = await fetch("/api/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("review request failed");
  return res.json();
}

function ProbabilityBar({ label, value, explanation, source }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: "#2A2118" }}>{label}</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#6B4A34" }}>{value}%</span>
      </div>
      <div style={{ height: 8, background: "#DDD3BC", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: "#C98A2B", borderRadius: 4 }} />
      </div>
      {explanation && <div style={{ fontSize: 13, color: "#5B5041", marginTop: 4 }}>{explanation}</div>}
      {source && (
        <div style={{ fontSize: 11.5, color: "#8A7F68", marginTop: 3, fontStyle: "italic" }}>
          Источник: {source}
        </div>
      )}
    </div>
  );
}

export default function Tool() {
  const [mode, setMode] = useState("diagnose");
  const [category, setCategory] = useState("plant");
  const [symptoms, setSymptoms] = useState("");
  const [extra, setExtra] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const [customEntries, setCustomEntries] = useState({ plants: [], animals: [] });
  const [pending, setPending] = useState([]);
  const [sourceCategory, setSourceCategory] = useState("plant");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    setCustomEntries(storageGet("bioai_custom_entries") || { plants: [], animals: [] });
    setPending(storageGet("bioai_pending_reviews") || []);
  }, []);

  function persistCustomEntries(updated) {
    setCustomEntries(updated);
    storageSet("bioai_custom_entries", updated);
  }
  function persistPending(updated) {
    setPending(updated);
    storageSet("bioai_pending_reviews", updated);
  }

  async function handleFile(file) {
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    const base64 = await fileToBase64(file);
    setImageData({ base64, mediaType: file.type || "image/jpeg" });
  }
  function clearImage() {
    setImagePreview(null);
    setImageData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAnalyze() {
    if (!symptoms.trim() && !imageData) {
      setError("Добавь фото или опиши симптомы — иначе анализировать нечего.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await callAnalyze({
        category,
        symptoms,
        extra,
        imageBase64: imageData?.base64,
        imageMediaType: imageData?.mediaType,
        customEntries,
      });
      setResult(res);
      setHistory((h) => [{ id: Date.now(), category, species: res.species, urgent: res.urgent }, ...h].slice(0, 6));
    } catch (e) {
      setError("Не получилось получить анализ. Попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitSource() {
    if (!sourceUrl.trim() && !sourceText.trim()) {
      setReviewError("Добавь ссылку или вставь текст источника.");
      return;
    }
    setReviewError(null);
    setReviewLoading(true);
    try {
      const review = await callReview({ category: sourceCategory, url: sourceUrl.trim(), text: sourceText.trim() });
      const item = { id: Date.now(), category: sourceCategory, url: sourceUrl.trim(), text: sourceText.trim(), review };
      persistPending([item, ...pending]);
      setSourceUrl("");
      setSourceText("");
    } catch (e) {
      setReviewError("Не получилось проверить источник. Попробуй ещё раз.");
    } finally {
      setReviewLoading(false);
    }
  }

  function approveEntry(id) {
    const item = pending.find((p) => p.id === id);
    if (!item || !item.review?.entry) return;
    const bucket = item.category === "plant" ? "plants" : "animals";
    persistCustomEntries({ ...customEntries, [bucket]: [...customEntries[bucket], item.review.entry] });
    persistPending(pending.filter((p) => p.id !== id));
  }
  function rejectEntry(id) {
    persistPending(pending.filter((p) => p.id !== id));
  }

  function exportMergedKB() {
    const merged = mergeKB(customEntries);
    const blob = JSON.stringify(merged, null, 2);
    const win = window.open("", "_blank");
    if (win) win.document.write(`<pre style="white-space:pre-wrap;font-family:monospace;padding:20px;">${blob.replace(/</g, "&lt;")}</pre>`);
  }

  const accent = category === "plant" ? "#4C7A4C" : "#8A5A3A";

  return (
    <div style={{ minHeight: "100vh", background: "#16241C", fontFamily: "'IBM Plex Sans', sans-serif", padding: "32px 16px", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 980, width: "100%" }}>
        <div className="bioai-hero" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#C98A2B" }}>
              <Sprout size={22} />
              <span style={{ fontSize: 13, letterSpacing: 0.5, color: "#9CB89C" }}>полевой журнал наблюдений</span>
            </div>
            <Link to="/" style={{ fontSize: 13, color: "#9CB89C", textDecoration: "none", borderBottom: "1px solid #3A4A3D" }}>
              ← на главную
            </Link>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 42, color: "#F1ECDF", margin: "6px 0 4px", fontWeight: 600 }}>BioAI</h1>
          <p style={{ color: "#B9C7B4", fontSize: 15, maxWidth: 560, lineHeight: 1.5 }}>
            Сфотографируй растение или питомца, опиши, что не так — и получи предварительную оценку состояния с рекомендациями.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[{ key: "diagnose", label: "Анализ", Icon: Search }, { key: "contribute", label: "Пополнить базу", Icon: BookPlus }].map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setMode(key)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 20, border: mode === key ? "1.5px solid #C98A2B" : "1.5px solid #3A4A3D", background: mode === key ? "#2A2118" : "transparent", color: mode === key ? "#F1ECDF" : "#9CB89C", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
              <Icon size={14} /> {label}
              {key === "contribute" && pending.length > 0 && (
                <span style={{ background: "#C98A2B", color: "#2A2118", borderRadius: 10, fontSize: 11, padding: "1px 7px", fontWeight: 700 }}>{pending.length}</span>
              )}
            </button>
          ))}
        </div>

        {mode === "diagnose" && (
          <div className="bioai-grid" style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: 20 }}>
            <div style={{ background: "#EFE8D8", borderRadius: 10, padding: 22, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {[{ key: "plant", label: "Растение", Icon: Leaf }, { key: "animal", label: "Животное", Icon: PawPrint }].map(({ key, label, Icon }) => (
                  <button key={key} onClick={() => setCategory(key)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 8px", borderRadius: 7, border: category === key ? "2px solid #2A2118" : "1px solid #C9BE9F", background: category === key ? "#2A2118" : "transparent", color: category === key ? "#F1ECDF" : "#2A2118", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 6 }}>1 · Фото (по желанию)</div>
              {imagePreview ? (
                <div style={{ position: "relative", marginBottom: 16 }}>
                  <img src={imagePreview} alt="preview" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8 }} />
                  <button onClick={clearImage} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 6, color: "#fff", padding: 5, cursor: "pointer", display: "flex" }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: 120, border: "1.5px dashed #B4A57D", borderRadius: 8, color: "#6B4A34", cursor: "pointer", marginBottom: 16, fontSize: 13 }}>
                  <Upload size={20} /> Загрузить фото
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} style={{ display: "none" }} />
                </label>
              )}

              <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 6 }}>2 · Симптомы или внешний вид</div>
              <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder={category === "plant" ? "Например: листья желтеют, на нижней стороне бурый налёт..." : "Например: покраснела кожа на животе, чешется, немного вялый..."} rows={3} style={{ width: "100%", border: "1px solid #C9BE9F", borderRadius: 8, padding: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical", marginBottom: 14, boxSizing: "border-box", background: "#FAF7EE" }} />

              <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 6 }}>3 · Доп. условия (по желанию)</div>
              <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder={category === "plant" ? "Полив, освещение, недавняя пересадка..." : "Возраст, порода, недавние изменения в питании..."} style={{ width: "100%", border: "1px solid #C9BE9F", borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 18, boxSizing: "border-box", background: "#FAF7EE" }} />

              <button onClick={handleAnalyze} disabled={loading} style={{ width: "100%", background: loading ? "#8A9A87" : "#2A2118", color: "#F1ECDF", border: "none", borderRadius: 8, padding: "13px 0", fontSize: 15, fontWeight: 600, cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? <Loader2 size={17} className="spin" /> : <Camera size={17} />}
                {loading ? "Анализирую..." : "Провести анализ"}
              </button>
              {error && <div style={{ color: "#B24C3A", fontSize: 13, marginTop: 10 }}>{error}</div>}

              {history.length > 0 && (
                <div style={{ marginTop: 22, borderTop: "1px solid #D9CFAF", paddingTop: 14 }}>
                  <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 8 }}>История сессии</div>
                  {history.map((h) => (
                    <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#4A3F30", marginBottom: 6 }}>
                      {h.category === "plant" ? <Leaf size={12} /> : <PawPrint size={12} />}
                      <span>{h.species}</span>
                      {h.urgent && <AlertTriangle size={12} color="#B24C3A" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: "#F1ECDF", borderRadius: 10, padding: 26, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", minHeight: 400 }}>
              {!result && !loading && (
                <div style={{ color: "#8A7F68", fontSize: 14, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 350, textAlign: "center", flexDirection: "column", gap: 10 }}>
                  <Leaf size={28} color="#B4A57D" />
                  Заполни данные слева и запусти анализ —<br />отчёт появится здесь.
                </div>
              )}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 350, color: "#6B4A34", gap: 10 }}>
                  <Loader2 size={20} className="spin" /> Анализирую фото и симптомы...
                </div>
              )}
              {result && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em" }}>Объект</div>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: "#2A2118" }}>{result.species}</div>
                    </div>
                    <div style={{ transform: "rotate(4deg)", border: `2px solid ${result.urgent ? "#B24C3A" : accent}`, color: result.urgent ? "#B24C3A" : accent, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>
                      {result.urgent ? "ТРЕБУЕТ ВНИМАНИЯ" : "ПРЕДВАРИТЕЛЬНЫЙ АНАЛИЗ"}
                    </div>
                  </div>

                  {result.urgent && result.urgent_note && (
                    <div style={{ display: "flex", gap: 8, background: "#F6E4DD", border: "1px solid #E0AC9C", borderRadius: 8, padding: "10px 12px", fontSize: 13.5, color: "#8A3626", marginBottom: 18 }}>
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                      {result.urgent_note}
                    </div>
                  )}

                  {result.detected_symptoms?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 8 }}>Обнаруженные признаки</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {result.detected_symptoms.map((s, i) => (
                          <span key={i} style={{ background: "#E3DCC7", borderRadius: 20, padding: "4px 12px", fontSize: 12.5, color: "#4A3F30" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 10 }}>Возможные причины</div>
                    {result.conditions?.map((c, i) => (
                      <ProbabilityBar key={i} label={c.name} value={c.probability} explanation={c.explanation} source={c.source} />
                    ))}
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 8 }}>Рекомендации</div>
                    {result.recommendations?.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 14, color: "#2A2118", marginBottom: 8, lineHeight: 1.4 }}>
                        <ChevronRight size={16} color={accent} style={{ flexShrink: 0, marginTop: 2 }} />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {mode === "contribute" && (
          <div className="bioai-grid" style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: 20 }}>
            <div style={{ background: "#EFE8D8", borderRadius: 10, padding: 22, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
              <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 6 }}>Категория</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[{ key: "plant", label: "Растение", Icon: Leaf }, { key: "animal", label: "Животное", Icon: PawPrint }].map(({ key, label, Icon }) => (
                  <button key={key} onClick={() => setSourceCategory(key)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 8px", borderRadius: 7, border: sourceCategory === key ? "2px solid #2A2118" : "1px solid #C9BE9F", background: sourceCategory === key ? "#2A2118" : "transparent", color: sourceCategory === key ? "#F1ECDF" : "#2A2118", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 6 }}>Ссылка на источник</div>
              <div style={{ position: "relative", marginBottom: 14 }}>
                <Link2 size={15} style={{ position: "absolute", left: 10, top: 12, color: "#8A7F68" }} />
                <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", border: "1px solid #C9BE9F", borderRadius: 8, padding: "10px 10px 10px 32px", fontSize: 14, boxSizing: "border-box", background: "#FAF7EE" }} />
              </div>

              <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 6 }}>Или вставь текст источника (необязательно)</div>
              <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Вставь выдержку с описанием болезни, симптомов, лечения..." rows={5} style={{ width: "100%", border: "1px solid #C9BE9F", borderRadius: 8, padding: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical", marginBottom: 16, boxSizing: "border-box", background: "#FAF7EE" }} />

              <button onClick={handleSubmitSource} disabled={reviewLoading} style={{ width: "100%", background: reviewLoading ? "#8A9A87" : "#2A2118", color: "#F1ECDF", border: "none", borderRadius: 8, padding: "13px 0", fontSize: 15, fontWeight: 600, cursor: reviewLoading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {reviewLoading ? <Loader2 size={17} className="spin" /> : <ShieldCheck size={17} />}
                {reviewLoading ? "Проверяю источник..." : "Отправить на проверку"}
              </button>
              {reviewError && <div style={{ color: "#B24C3A", fontSize: 13, marginTop: 10 }}>{reviewError}</div>}

              <div style={{ marginTop: 22, borderTop: "1px solid #D9CFAF", paddingTop: 14 }}>
                <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 8 }}>
                  В базе сейчас: {KNOWLEDGE_BASE.plants.length + KNOWLEDGE_BASE.animals.length} встроенных + {customEntries.plants.length + customEntries.animals.length} добавленных записей
                </div>
                <button onClick={exportMergedKB} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #C9BE9F", borderRadius: 7, padding: "7px 12px", fontSize: 12.5, color: "#4A3F30", cursor: "pointer" }}>
                  <Download size={13} /> Экспортировать всю базу (JSON)
                </button>
              </div>
            </div>

            <div style={{ background: "#F1ECDF", borderRadius: 10, padding: 26, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", minHeight: 400 }}>
              <div style={{ fontSize: 12, color: "#6B4A34", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 14 }}>Очередь на подтверждение</div>
              {pending.length === 0 && (
                <div style={{ color: "#8A7F68", fontSize: 14, textAlign: "center", marginTop: 60 }}>
                  Пока пусто. Пришли источник слева — ИИ проверит его и предложит запись сюда.
                </div>
              )}
              {pending.map((item) => {
                const v = item.review?.verdict;
                const verdictStyle = v === "trusted" ? { color: "#3F6B45", border: "#8FB98F", Icon: ShieldCheck, label: "Надёжный источник" } : v === "unreliable" ? { color: "#B24C3A", border: "#E0AC9C", Icon: ShieldAlert, label: "Сомнительный источник" } : { color: "#A67B2A", border: "#E0C68C", Icon: ShieldQuestion, label: "Требует внимания" };
                const entry = item.review?.entry;
                return (
                  <div key={item.id} style={{ border: `1.5px solid ${verdictStyle.border}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, color: verdictStyle.color, fontWeight: 700, fontSize: 13 }}>
                      <verdictStyle.Icon size={16} /> {verdictStyle.label}
                      {item.review?.domain_type && <span style={{ fontWeight: 400, color: "#6B4A34", fontSize: 12 }}>· {item.review.domain_type}</span>}
                    </div>
                    {item.url && <div style={{ fontSize: 12.5, color: "#4A3F30", marginBottom: 6, wordBreak: "break-all" }}>{item.url}</div>}
                    {item.review?.reasoning && <div style={{ fontSize: 13, color: "#5B5041", marginBottom: 10, lineHeight: 1.4 }}>{item.review.reasoning}</div>}
                    {entry ? (
                      <div style={{ background: "#FAF7EE", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#2A2118", marginBottom: 4 }}>{entry.name}</div>
                        {entry.symptoms?.length > 0 && <div style={{ fontSize: 12.5, color: "#5B5041", marginBottom: 3 }}><b>Симптомы:</b> {entry.symptoms.join(", ")}</div>}
                        {entry.cause && <div style={{ fontSize: 12.5, color: "#5B5041", marginBottom: 3 }}><b>Причина:</b> {entry.cause}</div>}
                        {entry.recommendations?.length > 0 && <div style={{ fontSize: 12.5, color: "#5B5041", marginBottom: 3 }}><b>Рекомендации:</b> {entry.recommendations.join(", ")}</div>}
                        <div style={{ fontSize: 11.5, color: "#8A7F68", fontStyle: "italic", marginTop: 4 }}>Источник для базы: {entry.source}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: "#8A7F68", marginBottom: 10, fontStyle: "italic" }}>ИИ не смог извлечь структурированную запись из этого источника.</div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => approveEntry(item.id)} disabled={!entry} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: entry ? "#3F6B45" : "#B9C3B4", color: "#fff", border: "none", borderRadius: 7, padding: "8px 0", fontSize: 13, fontWeight: 600, cursor: entry ? "pointer" : "default" }}>
                        <Check size={14} /> Добавить в базу
                      </button>
                      <button onClick={() => rejectEntry(item.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "none", color: "#8A3626", border: "1px solid #E0AC9C", borderRadius: 7, padding: "8px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        <Trash2 size={14} /> Отклонить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", color: "#6B7A68", fontSize: 12, marginTop: 20 }}>
          Предварительный анализ не заменяет консультацию агронома или ветеринара.
        </div>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        textarea:focus, input:focus { outline: 2px solid #C98A2B; outline-offset: 1px; }
        button:focus-visible { outline: 2px solid #C98A2B; outline-offset: 2px; }
        body { margin: 0; }

        .bioai-hero { animation: bioai-rise 0.5s ease-out; }
        @keyframes bioai-rise {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bioai-hero { animation: none; }
        }

        @media (max-width: 760px) {
          .bioai-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
