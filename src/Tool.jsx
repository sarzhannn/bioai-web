import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Leaf, PawPrint, Upload, Camera, Loader2, AlertTriangle, ChevronRight, Sprout, X,
  BookPlus, ShieldCheck, ShieldAlert, ShieldQuestion, Link2, Check, Trash2, Download, Search, Globe,
} from "lucide-react";
import { KNOWLEDGE_BASE, mergeKB } from "../lib/knowledgeBase.js";

const T = {
  ru: {
    langLabel: "Русский",
    journal: "полевой журнал наблюдений",
    backHome: "На главную",
    subtitle: "Сфотографируй растение или питомца, опиши, что не так, и получи предварительную оценку состояния с рекомендациями.",
    tabs: { diagnose: "Анализ", contribute: "Пополнить базу" },
    categoryPlant: "Растение",
    categoryAnimal: "Животное",
    step1: "1 · Фото (по желанию)",
    uploadPhoto: "Загрузить фото",
    step2: "2 · Симптомы или внешний вид",
    symptomsPlaceholder: {
      plant: "Например: листья желтеют, на нижней стороне бурый налёт...",
      animal: "Например: покраснела кожа на животе, чешется, немного вялый...",
    },
    step3: "3 · Доп. условия (по желанию)",
    extraPlaceholder: {
      plant: "Полив, освещение, недавняя пересадка...",
      animal: "Возраст, порода, недавние изменения в питании...",
    },
    analyze: "Провести анализ",
    analyzing: "Анализирую...",
    errorNoInput: "Добавь фото или опиши симптомы, иначе анализировать нечего.",
    errorAnalyzeFailed: "Не получилось получить анализ. Попробуй ещё раз.",
    sessionHistory: "История сессии",
    resultPlaceholder: ["Заполни данные слева и запусти анализ,", "отчёт появится здесь."],
    analyzingResult: "Анализирую фото и симптомы...",
    object: "Объект",
    urgentBadge: "ТРЕБУЕТ ВНИМАНИЯ",
    previewBadge: "ПРЕДВАРИТЕЛЬНЫЙ АНАЛИЗ",
    detectedSymptoms: "Обнаруженные признаки",
    possibleCauses: "Возможные причины",
    recommendations: "Рекомендации",
    source: "Источник",
    category: "Категория",
    sourceLink: "Ссылка на источник",
    sourceTextLabel: "Или вставь текст источника (необязательно)",
    sourceTextPlaceholder: "Вставь выдержку с описанием болезни, симптомов, лечения...",
    submitReview: "Отправить на проверку",
    reviewing: "Проверяю источник...",
    reviewErrorNoInput: "Добавь ссылку или вставь текст источника.",
    reviewErrorFailed: "Не получилось проверить источник. Попробуй ещё раз.",
    dbCount: (n, m) => `В базе сейчас: ${n} встроенных + ${m} добавленных записей`,
    exportDb: "Экспортировать всю базу (JSON)",
    queueTitle: "Очередь на подтверждение",
    queueEmpty: "Пока пусто. Пришли источник слева, ИИ проверит его и предложит запись сюда.",
    verdict: { trusted: "Надёжный источник", unreliable: "Сомнительный источник", uncertain: "Требует внимания" },
    symptomsWord: "Симптомы",
    causeWord: "Причина",
    recommendationsWord: "Рекомендации",
    sourceForDb: "Источник для базы",
    noStructured: "ИИ не смог извлечь структурированную запись из этого источника.",
    addToDb: "Добавить в базу",
    reject: "Отклонить",
    footer: "Предварительный анализ, а не диагноз: рядом всегда должен быть агроном или ветеринар.",
    submittedToast: "Информация загружена — отправлена на рассмотрение, ожидайте",
    queueProcessing: "Проверяем источник, обычно это занимает несколько секунд...",
    queueError: "Проверка не завершилась вовремя. Источник остался в очереди — можно повторить.",
    retry: "Повторить проверку",
    noGrounding: "Проверено без живого веб-поиска (закончилась квота) — стоит перепроверить вручную",
  },
  kz: {
    langLabel: "Қазақша",
    journal: "далалық бақылау журналы",
    backHome: "Басты бетке",
    subtitle: "Өсімдікті немесе үй жануарын суретке түсір, немесе не дұрыс емес екенін сипатта, ұсыныстары бар алдын ала бағалау аласың.",
    tabs: { diagnose: "Талдау", contribute: "Қорды толықтыру" },
    categoryPlant: "Өсімдік",
    categoryAnimal: "Жануар",
    step1: "1 · Фото (қалауыңызша)",
    uploadPhoto: "Фото жүктеу",
    step2: "2 · Симптомдар немесе сыртқы түрі",
    symptomsPlaceholder: {
      plant: "Мысалы: жапырақтар сарғаяды, астыңғы жағында қоңыр дақ бар...",
      animal: "Мысалы: іштің терісі қызарды, қышиды, сәл әлсіз...",
    },
    step3: "3 · Қосымша жағдайлар (қалауыңызша)",
    extraPlaceholder: {
      plant: "Суару, жарық, жақындағы отырғызу...",
      animal: "Жасы, тұқымы, тамақтанудағы соңғы өзгерістер...",
    },
    analyze: "Талдау жасау",
    analyzing: "Талдауда...",
    errorNoInput: "Фото қос немесе симптомдарды сипатта, әйтпесе талдайтын ештеңе жоқ.",
    errorAnalyzeFailed: "Талдауды алу мүмкін болмады. Қайта көріп көр.",
    sessionHistory: "Сессия тарихы",
    resultPlaceholder: ["Сол жақтағы деректерді толтырып, талдауды іске қос,", "есеп осында пайда болады."],
    analyzingResult: "Фото мен симптомдарды талдауда...",
    object: "Нысан",
    urgentBadge: "НАЗАР АУДАРУДЫ ҚАЖЕТ ЕТЕДІ",
    previewBadge: "АЛДЫН АЛА ТАЛДАУ",
    detectedSymptoms: "Анықталған белгілер",
    possibleCauses: "Ықтимал себептер",
    recommendations: "Ұсыныстар",
    source: "Дереккөз",
    category: "Санат",
    sourceLink: "Дереккөзге сілтеме",
    sourceTextLabel: "Немесе дереккөз мәтінін қой (міндетті емес)",
    sourceTextPlaceholder: "Ауру, симптомдар, емдеу сипаттамасы бар үзіндіні қой...",
    submitReview: "Тексеруге жіберу",
    reviewing: "Дереккөз тексерілуде...",
    reviewErrorNoInput: "Сілтеме қос немесе дереккөз мәтінін кірістір.",
    reviewErrorFailed: "Дереккөзді тексеру мүмкін болмады. Қайта көріп көр.",
    dbCount: (n, m) => `Қазір қорда: ${n} кіріктірілген + ${m} қосылған жазба`,
    exportDb: "Барлық қорды экспорттау (JSON)",
    queueTitle: "Растауды күту кезегі",
    queueEmpty: "Әзірге бос. Сол жақтан дереккөз жібер, ЖИ оны тексеріп, осында жазба ұсынады.",
    verdict: { trusted: "Сенімді дереккөз", unreliable: "Күмәнді дереккөз", uncertain: "Назар аудару қажет" },
    symptomsWord: "Симптомдар",
    causeWord: "Себебі",
    recommendationsWord: "Ұсыныстар",
    sourceForDb: "Қорға арналған дереккөз",
    noStructured: "ЖИ бұл дереккөзден құрылымдалған жазба шығара алмады.",
    addToDb: "Қорға қосу",
    reject: "Қабылдамау",
    footer: "Бұл алдын ала талдау, диагноз емес: жанында әрқашан агроном немесе ветеринар болуы керек.",
    submittedToast: "Ақпарат жүктелді — тексеруге жіберілді, күте тұрыңыз",
    queueProcessing: "Дереккөз тексерілуде, бұл әдетте бірнеше секунд алады...",
    queueError: "Тексеру уақытында аяқталмады. Дереккөз кезекте қалды — қайталап көруге болады.",
    retry: "Қайта тексеру",
    noGrounding: "Тірі веб-іздеусіз тексерілді (квота бітті) — қолмен тексеріп шыққан жөн",
  },
};

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

function ProbabilityBar({ label, value, explanation, source, sourceLabel }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
        <span style={{ fontWeight: 600, color: "#12291B" }}>{label}</span>
        <span style={{ fontFamily: "'Pixelify Sans', monospace", color: "#41523F" }}>{value}%</span>
      </div>
      <div style={{ height: 8, background: "#DCEBD9", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: "#1F8F5A", borderRadius: 4 }} />
      </div>
      {explanation && <div style={{ fontSize: 13, color: "#41523F", marginTop: 4 }}>{explanation}</div>}
      {source && (
        <div style={{ fontSize: 11.5, color: "#5B6B58", marginTop: 3, fontStyle: "italic" }}>
          {sourceLabel}: {source}
        </div>
      )}
    </div>
  );
}

export default function Tool({ lang = "ru", setLang }) {
  const t = T[lang];
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
  const [submittedToast, setSubmittedToast] = useState(false);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    setCustomEntries(storageGet("vitalens_custom_entries") || { plants: [], animals: [] });
    setPending(storageGet("vitalens_pending_reviews") || []);
  }, []);

  function persistCustomEntries(updated) {
    setCustomEntries(updated);
    storageSet("vitalens_custom_entries", updated);
  }
  function persistPending(updated) {
    setPending(updated);
    storageSet("vitalens_pending_reviews", updated);
  }
  // функциональные версии — безопасны, даже если состояние очереди
  // успело измениться, пока в фоне ждём ответ от ИИ-проверки
  function addPendingItem(item) {
    setPending((prev) => {
      const updated = [item, ...prev];
      storageSet("vitalens_pending_reviews", updated);
      return updated;
    });
  }
  function updatePendingItem(id, patch) {
    setPending((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
      storageSet("vitalens_pending_reviews", updated);
      return updated;
    });
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
      setError(t.errorNoInput);
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
        lang,
        imageBase64: imageData?.base64,
        imageMediaType: imageData?.mediaType,
        customEntries,
      });
      setResult(res);
      setHistory((h) => [{ id: Date.now(), category, species: res.species, urgent: res.urgent }, ...h].slice(0, 6));
    } catch (e) {
      setError(t.errorAnalyzeFailed);
    } finally {
      setLoading(false);
    }
  }

  function flashSubmittedToast() {
    setSubmittedToast(true);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setSubmittedToast(false), 3400);
  }

  async function runReview(item) {
    try {
      const review = await callReview({ category: item.category, url: item.url, text: item.text, lang });
      updatePendingItem(item.id, { review, status: "done" });
    } catch (e) {
      updatePendingItem(item.id, { status: "error" });
    }
  }

  async function handleSubmitSource() {
    if (!sourceUrl.trim() && !sourceText.trim()) {
      setReviewError(t.reviewErrorNoInput);
      return;
    }
    setReviewError(null);

    // Показываем подтверждение и кладём источник в очередь сразу,
    // не дожидаясь ответа ИИ — проверка с веб-поиском может занимать
    // много времени, а пользователь должен сразу видеть, что всё принято.
    const item = { id: Date.now(), category: sourceCategory, url: sourceUrl.trim(), text: sourceText.trim(), status: "processing" };
    addPendingItem(item);
    setSourceUrl("");
    setSourceText("");
    flashSubmittedToast();

    setReviewLoading(true);
    try {
      await runReview(item);
    } finally {
      setReviewLoading(false);
    }
  }

  async function retryReview(id) {
    const item = pending.find((p) => p.id === id);
    if (!item) return;
    updatePendingItem(id, { status: "processing" });
    await runReview({ ...item, id });
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

  const accent = category === "plant" ? "#1F8F5A" : "#C97A2B";

  return (
    <div style={{ minHeight: "100vh", background: "#EFF5EC", fontFamily: "'Inter', sans-serif", padding: "32px 16px", display: "flex", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", width: 380, height: 380, top: -140, left: -120, borderRadius: "50%", background: "radial-gradient(circle, #B9E8A8, transparent 70%)", filter: "blur(70px)", zIndex: 0 }} />
      <div aria-hidden style={{ position: "absolute", width: 320, height: 320, bottom: -120, right: -100, borderRadius: "50%", background: "radial-gradient(circle, #9FE8D4, transparent 70%)", filter: "blur(70px)", opacity: 0.6, zIndex: 0 }} />
      <div style={{ maxWidth: 980, width: "100%", position: "relative", zIndex: 1 }}>
        <div className="bioai-hero" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#1F8F5A" }}>
              <Sprout size={22} />
              <span style={{ fontSize: 13, letterSpacing: 0.5, color: "#5B6B58" }}>{t.journal}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setLang && setLang(lang === "ru" ? "kz" : "ru")}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #C9D9C7", borderRadius: 20, padding: "7px 14px", fontSize: 13, fontWeight: 500, color: "#41523F", cursor: "pointer" }}
              >
                <Globe size={13} /> {t.langLabel}
              </button>
              <Link to="/" style={{ fontSize: 13, color: "#5B6B58", textDecoration: "none", borderBottom: "1px solid #C9D9C7" }}>
                ← {t.backHome}
              </Link>
            </div>
          </div>
          <h1 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 42, color: "#12291B", margin: "6px 0 4px", fontWeight: 600 }}>VitaLens</h1>
          <p style={{ color: "#41523F", fontSize: 15, maxWidth: 560, lineHeight: 1.5 }}>
            {t.subtitle}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[{ key: "diagnose", label: t.tabs.diagnose, Icon: Search }, { key: "contribute", label: t.tabs.contribute, Icon: BookPlus }].map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setMode(key)} className="vl-tab" style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 20, border: mode === key ? "1.5px solid #1F8F5A" : "1.5px solid #C9D9C7", background: mode === key ? "#12291B" : "transparent", color: mode === key ? "#EFF5EC" : "#5B6B58", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
              <Icon size={14} /> {label}
              {key === "contribute" && pending.length > 0 && (
                <span style={{ background: "#1F8F5A", color: "#12291B", borderRadius: 10, fontSize: 11, padding: "1px 7px", fontWeight: 700 }}>{pending.length}</span>
              )}
            </button>
          ))}
        </div>

        {mode === "diagnose" && (
          <div className="bioai-grid" style={{ display: "grid", gridTemplateColumns: "minmax(280px, 380px) 1fr", gap: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", borderRadius: 18, padding: 22, border: "1px solid rgba(255,255,255,0.8)" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                {[{ key: "plant", label: t.categoryPlant, Icon: Leaf }, { key: "animal", label: t.categoryAnimal, Icon: PawPrint }].map(({ key, label, Icon }) => (
                  <button key={key} onClick={() => setCategory(key)} className="vl-tab" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 8px", borderRadius: 7, border: category === key ? "2px solid #12291B" : "1px solid #C9D9C7", background: category === key ? "#12291B" : "transparent", color: category === key ? "#EFF5EC" : "#12291B", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    <Icon size={16} /> {label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 6 }}>{t.step1}</div>
              {imagePreview ? (
                <div style={{ position: "relative", marginBottom: 16 }}>
                  <img src={imagePreview} alt="preview" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 8 }} />
                  <button onClick={clearImage} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 6, color: "#fff", padding: 5, cursor: "pointer", display: "flex" }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, height: 120, border: "1.5px dashed #B9D9B4", borderRadius: 8, color: "#41523F", cursor: "pointer", marginBottom: 16, fontSize: 13 }}>
                  <Upload size={20} /> {t.uploadPhoto}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} style={{ display: "none" }} />
                </label>
              )}

              <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 6 }}>{t.step2}</div>
              <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder={category === "plant" ? t.symptomsPlaceholder.plant : t.symptomsPlaceholder.animal} rows={3} style={{ width: "100%", border: "1px solid #C9D9C7", borderRadius: 8, padding: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical", marginBottom: 14, boxSizing: "border-box", background: "#F6FAF4" }} />

              <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 6 }}>{t.step3}</div>
              <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder={category === "plant" ? t.extraPlaceholder.plant : t.extraPlaceholder.animal} style={{ width: "100%", border: "1px solid #C9D9C7", borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 18, boxSizing: "border-box", background: "#F6FAF4" }} />

              <button onClick={handleAnalyze} disabled={loading} className="vl-cta" style={{ width: "100%", background: loading ? "#8A9A87" : "linear-gradient(135deg, #37B36A, #14713F)", color: "#EFF5EC", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? <Loader2 size={17} className="spin" /> : <Camera size={17} />}
                {loading ? t.analyzing : t.analyze}
              </button>
              {error && <div style={{ color: "#B24C3A", fontSize: 13, marginTop: 10 }}>{error}</div>}

              {history.length > 0 && (
                <div style={{ marginTop: 22, borderTop: "1px solid #DCEBD9", paddingTop: 14 }}>
                  <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 8 }}>{t.sessionHistory}</div>
                  {history.map((h) => (
                    <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#2A3B2E", marginBottom: 6 }}>
                      {h.category === "plant" ? <Leaf size={12} /> : <PawPrint size={12} />}
                      <span>{h.species}</span>
                      {h.urgent && <AlertTriangle size={12} color="#B24C3A" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", borderRadius: 18, padding: 26, border: "1px solid rgba(255,255,255,0.8)", minHeight: 400 }}>
              {!result && !loading && (
                <div style={{ color: "#5B6B58", fontSize: 14, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 350, textAlign: "center", flexDirection: "column", gap: 10 }}>
                  <Leaf size={28} color="#B9D9B4" />
                  {t.resultPlaceholder[0]}<br />{t.resultPlaceholder[1]}
                </div>
              )}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 350, color: "#41523F", gap: 10 }}>
                  <Loader2 size={20} className="spin" /> {t.analyzingResult}
                </div>
              )}
              {result && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em" }}>{t.object}</div>
                      <div style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 26, color: "#12291B" }}>{result.species}</div>
                    </div>
                    <div style={{ transform: "rotate(4deg)", border: `2px solid ${result.urgent ? "#B24C3A" : accent}`, color: result.urgent ? "#B24C3A" : accent, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>
                      {result.urgent ? t.urgentBadge : t.previewBadge}
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
                      <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 8 }}>{t.detectedSymptoms}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {result.detected_symptoms.map((s, i) => (
                          <span key={i} style={{ background: "#DCF2DE", borderRadius: 20, padding: "4px 12px", fontSize: 12.5, color: "#2A3B2E" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 10 }}>{t.possibleCauses}</div>
                    {result.conditions?.map((c, i) => (
                      <ProbabilityBar key={i} label={c.name} value={c.probability} explanation={c.explanation} source={c.source} sourceLabel={t.source} />
                    ))}
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 8 }}>{t.recommendations}</div>
                    {result.recommendations?.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 14, color: "#12291B", marginBottom: 8, lineHeight: 1.4 }}>
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
            <div style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", borderRadius: 18, padding: 22, border: "1px solid rgba(255,255,255,0.8)" }}>
              <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 6 }}>{t.category}</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {[{ key: "plant", label: t.categoryPlant, Icon: Leaf }, { key: "animal", label: t.categoryAnimal, Icon: PawPrint }].map(({ key, label, Icon }) => (
                  <button key={key} onClick={() => setSourceCategory(key)} className="vl-tab" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 8px", borderRadius: 7, border: sourceCategory === key ? "2px solid #12291B" : "1px solid #C9D9C7", background: sourceCategory === key ? "#12291B" : "transparent", color: sourceCategory === key ? "#EFF5EC" : "#12291B", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 6 }}>{t.sourceLink}</div>
              <div style={{ position: "relative", marginBottom: 14 }}>
                <Link2 size={15} style={{ position: "absolute", left: 10, top: 12, color: "#5B6B58" }} />
                <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://..." style={{ width: "100%", border: "1px solid #C9D9C7", borderRadius: 8, padding: "10px 10px 10px 32px", fontSize: 14, boxSizing: "border-box", background: "#F6FAF4" }} />
              </div>

              <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 6 }}>{t.sourceTextLabel}</div>
              <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder={t.sourceTextPlaceholder} rows={5} style={{ width: "100%", border: "1px solid #C9D9C7", borderRadius: 8, padding: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical", marginBottom: 16, boxSizing: "border-box", background: "#F6FAF4" }} />

              <button onClick={handleSubmitSource} disabled={reviewLoading} className="vl-cta" style={{ width: "100%", background: reviewLoading ? "#8A9A87" : "linear-gradient(135deg, #37B36A, #14713F)", color: "#EFF5EC", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: reviewLoading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {reviewLoading ? <Loader2 size={17} className="spin" /> : <ShieldCheck size={17} />}
                {reviewLoading ? t.reviewing : t.submitReview}
              </button>
              {reviewError && <div style={{ color: "#B24C3A", fontSize: 13, marginTop: 10 }}>{reviewError}</div>}

              <div aria-live="polite" style={{ height: submittedToast ? "auto" : 0, marginTop: submittedToast ? 12 : 0, overflow: "hidden", transition: "margin 0.25s ease" }}>
                {submittedToast && (
                  <div className="vl-toast-in" style={{ display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg, #1F8F5A, #14713F)", color: "#EFF5EC", borderRadius: 10, padding: "12px 14px", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 20px rgba(20,113,63,0.28)" }}>
                    <span className="vl-toast-dot" />
                    <Check size={16} style={{ flexShrink: 0 }} />
                    {t.submittedToast}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 22, borderTop: "1px solid #DCEBD9", paddingTop: 14 }}>
                <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 8 }}>
                  {t.dbCount(KNOWLEDGE_BASE.plants.length + KNOWLEDGE_BASE.animals.length, customEntries.plants.length + customEntries.animals.length)}
                </div>
                <button onClick={exportMergedKB} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #C9D9C7", borderRadius: 7, padding: "7px 12px", fontSize: 12.5, color: "#2A3B2E", cursor: "pointer" }}>
                  <Download size={13} /> {t.exportDb}
                </button>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", borderRadius: 18, padding: 26, border: "1px solid rgba(255,255,255,0.8)", minHeight: 400 }}>
              <div style={{ fontSize: 12, color: "#41523F", fontWeight: 600, letterSpacing: "0.02em", marginBottom: 14 }}>{t.queueTitle}</div>
              {pending.length === 0 && (
                <div style={{ color: "#5B6B58", fontSize: 14, textAlign: "center", marginTop: 60 }}>
                  {t.queueEmpty}
                </div>
              )}
              {pending.map((item) => {
                if (item.status === "processing") {
                  return (
                    <div key={item.id} className="vl-queue-in" style={{ border: "1.5px solid #C9D9C7", borderRadius: 10, padding: 16, marginBottom: 14, background: "#F6FAF4" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#41523F", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                        <Loader2 size={16} className="spin" /> {t.reviewing}
                      </div>
                      {item.url && <div style={{ fontSize: 12.5, color: "#2A3B2E", marginBottom: 10, wordBreak: "break-all" }}>{item.url}</div>}
                      <div style={{ fontSize: 12.5, color: "#5B6B58", marginBottom: 10 }}>{t.queueProcessing}</div>
                      <div className="vl-shimmer" style={{ height: 8, borderRadius: 4, marginBottom: 6 }} />
                      <div className="vl-shimmer" style={{ height: 8, borderRadius: 4, width: "70%" }} />
                    </div>
                  );
                }
                if (item.status === "error") {
                  return (
                    <div key={item.id} className="vl-queue-in" style={{ border: "1.5px solid #E0AC9C", borderRadius: 10, padding: 16, marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, color: "#B24C3A", fontWeight: 700, fontSize: 13 }}>
                        <AlertTriangle size={16} /> {t.reviewErrorFailed}
                      </div>
                      {item.url && <div style={{ fontSize: 12.5, color: "#2A3B2E", marginBottom: 6, wordBreak: "break-all" }}>{item.url}</div>}
                      <div style={{ fontSize: 12.5, color: "#5B6B58", marginBottom: 12 }}>{t.queueError}</div>
                      <button onClick={() => retryReview(item.id)} className="vl-cta" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", background: "#12291B", color: "#EFF5EC", border: "none", borderRadius: 7, padding: "9px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        <ShieldCheck size={14} /> {t.retry}
                      </button>
                    </div>
                  );
                }
                const v = item.review?.verdict;
                const verdictStyle = v === "trusted" ? { color: "#1F8F5A", border: "#9FE0B0", Icon: ShieldCheck, label: t.verdict.trusted } : v === "unreliable" ? { color: "#B24C3A", border: "#E0AC9C", Icon: ShieldAlert, label: t.verdict.unreliable } : { color: "#A67B2A", border: "#E0C68C", Icon: ShieldQuestion, label: t.verdict.uncertain };
                const entry = item.review?.entry;
                return (
                  <div key={item.id} className="vl-queue-in" style={{ border: `1.5px solid ${verdictStyle.border}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, color: verdictStyle.color, fontWeight: 700, fontSize: 13 }}>
                      <verdictStyle.Icon size={16} /> {verdictStyle.label}
                      {item.review?.domain_type && <span style={{ fontWeight: 400, color: "#41523F", fontSize: 12 }}>· {item.review.domain_type}</span>}
                    </div>
                    {item.review?.grounded === false && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FBF2DC", border: "1px solid #E0C68C", borderRadius: 7, padding: "6px 10px", fontSize: 11.5, color: "#8A6A1F", marginBottom: 10 }}>
                        <ShieldQuestion size={13} style={{ flexShrink: 0 }} /> {t.noGrounding}
                      </div>
                    )}
                    {item.url && <div style={{ fontSize: 12.5, color: "#2A3B2E", marginBottom: 6, wordBreak: "break-all" }}>{item.url}</div>}
                    {item.review?.reasoning && <div style={{ fontSize: 13, color: "#41523F", marginBottom: 10, lineHeight: 1.4 }}>{item.review.reasoning}</div>}
                    {entry ? (
                      <div style={{ background: "#F6FAF4", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#12291B", marginBottom: 4 }}>{entry.name}</div>
                        {entry.symptoms?.length > 0 && <div style={{ fontSize: 12.5, color: "#41523F", marginBottom: 3 }}><b>{t.symptomsWord}:</b> {entry.symptoms.join(", ")}</div>}
                        {entry.cause && <div style={{ fontSize: 12.5, color: "#41523F", marginBottom: 3 }}><b>{t.causeWord}:</b> {entry.cause}</div>}
                        {entry.recommendations?.length > 0 && <div style={{ fontSize: 12.5, color: "#41523F", marginBottom: 3 }}><b>{t.recommendationsWord}:</b> {entry.recommendations.join(", ")}</div>}
                        <div style={{ fontSize: 11.5, color: "#5B6B58", fontStyle: "italic", marginTop: 4 }}>{t.sourceForDb}: {entry.source}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: "#5B6B58", marginBottom: 10, fontStyle: "italic" }}>{t.noStructured}</div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => approveEntry(item.id)} disabled={!entry} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: entry ? "#1F8F5A" : "#C9D9C7", color: "#fff", border: "none", borderRadius: 7, padding: "8px 0", fontSize: 13, fontWeight: 600, cursor: entry ? "pointer" : "default" }}>
                        <Check size={14} /> {t.addToDb}
                      </button>
                      <button onClick={() => rejectEntry(item.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "none", color: "#8A3626", border: "1px solid #E0AC9C", borderRadius: 7, padding: "8px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        <Trash2 size={14} /> {t.reject}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 20, position: "relative", zIndex: 1 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#5B6B58", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(31,143,90,0.15)", borderRadius: 20, padding: "8px 16px" }}>
            🌿🐾 {t.footer}
          </span>
        </div>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        textarea:focus, input:focus { outline: 2px solid #1F8F5A; outline-offset: 1px; }
        button:focus-visible { outline: 2px solid #1F8F5A; outline-offset: 2px; }
        body { margin: 0; }

        .vl-cta { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .vl-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(20,113,63,0.32); }

        .bioai-hero { animation: bioai-rise 0.5s ease-out; }
        @keyframes bioai-rise {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .bioai-grid { animation: bioai-rise 0.4s ease-out; }

        .vl-toast-in { animation: vl-toast-slide 0.35s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes vl-toast-slide {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .vl-toast-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #C9F2D2; flex-shrink: 0;
          animation: vl-pulse-dot 1.2s ease-in-out infinite;
        }
        @keyframes vl-pulse-dot {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        .vl-queue-in { animation: vl-queue-rise 0.35s ease-out; }
        @keyframes vl-queue-rise {
          from { opacity: 0; transform: translateY(8px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .vl-shimmer {
          background: linear-gradient(90deg, #E4EFE1 25%, #F3F9F1 37%, #E4EFE1 63%);
          background-size: 400% 100%;
          animation: vl-shimmer-move 1.4s ease-in-out infinite;
        }
        @keyframes vl-shimmer-move {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .vl-tab { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .vl-tab:hover { transform: translateY(-1px) scale(1.02); box-shadow: 0 6px 14px rgba(18,41,27,0.1); }

        @media (prefers-reduced-motion: reduce) {
          .bioai-hero, .bioai-grid, .vl-toast-in, .vl-toast-dot, .vl-queue-in, .vl-shimmer, .vl-tab { animation: none; }
          .vl-tab:hover { transform: none; }
        }

        @media (max-width: 760px) {
          .bioai-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
