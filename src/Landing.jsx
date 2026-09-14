import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Camera, Sparkles, Database, Leaf, PawPrint } from "lucide-react";
import GlassOrb from "./GlassOrb.jsx";
import FloatingBackground from "./FloatingBackground.jsx";
import CornerArt from "./CornerArt.jsx";

const NAV_ITEMS = {
  ru: ["Главная", "О проекте", "Приложение"],
  kz: ["Басты бет", "Жоба туралы", "Қолданба"],
};

const COPY = {
  ru: {
    statLeftLabel: "точность на тестовых данных",
    statRightLabel: "проверенных источников в базе",
    statNum: 92,
    statNum2: 23,
    tagline: "ИИ-анализ растений и питомцев за секунды",
    start: "Открыть приложение",
    scroll: "Прокрутить вниз",
    lang: "Русский",
    quote: "Растение не умеет пожаловаться, питомец не умеет объяснить. Мы просто помогаем услышать то, что они уже пытаются сказать.",
    footer: "Предварительный анализ, а не диагноз: рядом всегда должен быть агроном или ветеринар.",
    aboutTag: "как это устроено",
    aboutTitle: "Что стоит за анализом",
    aboutCards: [
      {
        icon: Camera,
        title: "Мультимодальный вход",
        text: "Фото и текстовое описание симптомов анализируются вместе: модель получает и картинку, и контекст, а не только одно из двух.",
      },
      {
        icon: Database,
        title: "База знаний из реальных источников",
        text: "Собрана из материалов сельскохозяйственных расширений университетов (Wisconsin-Madison, Nebraska, Arizona, Florida) и ветеринарных ресурсов (ASPCA, VCA).",
      },
      {
        icon: Sparkles,
        title: "Обучен на реальных датасетах",
        text: "Классификатор дообучен на PlantVillage (растения) и Cat Skin Disease V2 (животные) поверх MobileNetV2 методом transfer learning.",
      },
    ],
    metricsTitle: "Результаты обучения классификатора",
    metrics: [
      { label: "Accuracy", value: 96 },
      { label: "Recall", value: 92 },
      { label: "Precision", value: 96 },
      { label: "F1-score", value: 96 },
    ],
  },
  kz: {
    statLeftLabel: "тест деректеріндегі дәлдік",
    statRightLabel: "білім қорындағы тексерілген дереккөз",
    statNum: 92,
    statNum2: 23,
    tagline: "Өсімдіктер мен үй жануарларын ЖИ көмегімен секунд ішінде талдау",
    start: "Қолданбаны ашу",
    scroll: "Төмен түсіру",
    lang: "Қазақша",
    quote: "Өсімдік шағыммен келмейді, үй жануары түсіндіре алмайды. Біз тек олар айтқысы келгенді естуге көмектесеміз.",
    footer: "Бұл алдын ала талдау, диагноз емес: жанында әрқашан агроном немесе ветеринар болуы керек.",
    aboutTag: "бұл қалай жұмыс істейді",
    aboutTitle: "Талдаудың артында не тұр",
    aboutCards: [
      {
        icon: Camera,
        title: "Мультимодалды кіріс",
        text: "Фото мен симптомдардың мәтіндік сипаттамасы бірге талданады: модель тек біреуін емес, суретті де, контекстті де алады.",
      },
      {
        icon: Database,
        title: "Нақты дереккөздерден жиналған білім қоры",
        text: "Университеттердің ауыл шаруашылығы кеңейтімдерінен (Wisconsin-Madison, Nebraska, Arizona, Florida) және ветеринарлық ресурстардан (ASPCA, VCA) жиналған.",
      },
      {
        icon: Sparkles,
        title: "Нақты деректер жиынтығында оқытылған",
        text: "Классификатор PlantVillage (өсімдіктер) және Cat Skin Disease V2 (жануарлар) деректерінде MobileNetV2 негізінде transfer learning әдісімен дообучен.",
      },
    ],
    metricsTitle: "Классификаторды оқыту нәтижелері",
    metrics: [
      { label: "Accuracy", value: 96 },
      { label: "Recall", value: 92 },
      { label: "Precision", value: 96 },
      { label: "F1-score", value: 96 },
    ],
  },
};

function useCountUp(target, active) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 900;
    const start = performance.now();
    let raf;
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return value;
}

function MetricBar({ label, value, active, index }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
        <span style={{ color: "#EFF5EC", fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: "'Pixelify Sans', monospace", color: "#8FE36B", fontWeight: 700 }}>{value}%</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 4, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: active ? `${value}%` : "0%",
            background: "linear-gradient(90deg, #4FBF4A, #8FE36B)",
            borderRadius: 4,
            transition: `width 1.1s cubic-bezier(0.22, 1, 0.36, 1) ${index * 0.15}s`,
          }}
        />
      </div>
    </div>
  );
}

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

export default function Landing({ lang, setLang }) {
  const navigate = useNavigate();
  const aboutRef = useRef(null);
  const topRef = useRef(null);
  const [metricsRef, metricsInView] = useInView();
  const [cardsRef, cardsInView] = useInView();
  const t = COPY[lang];
  const statNum = useCountUp(t.statNum, true);
  const statNum2 = useCountUp(t.statNum2, true);

  function scrollToAbout() {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  function scrollToTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#EFF5EC", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden" }}>
      <div ref={topRef} />
      <div aria-hidden className="vl-blob" style={{ position: "absolute", width: 420, height: 420, top: -120, left: -100, borderRadius: "50%", background: "radial-gradient(circle,#B9E8A8,transparent 70%)", filter: "blur(70px)", zIndex: 0, animationDuration: "16s" }} />
      <div aria-hidden className="vl-blob" style={{ position: "absolute", width: 360, height: 360, bottom: -100, left: "20%", borderRadius: "50%", background: "radial-gradient(circle,#FFE9A8,transparent 70%)", filter: "blur(70px)", opacity: 0.6, zIndex: 0, animationDuration: "20s", animationDelay: "-4s" }} />
      <div aria-hidden className="vl-blob" style={{ position: "absolute", width: 300, height: 300, top: "20%", right: -80, borderRadius: "50%", background: "radial-gradient(circle,#9FE8D4,transparent 70%)", filter: "blur(70px)", opacity: 0.5, zIndex: 0, animationDuration: "18s", animationDelay: "-9s" }} />

      <CornerArt />

      {/* NAV */}
      <div className="vl-enter" style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Unbounded', sans-serif", fontWeight: 700, fontSize: 17, color: "#12291B" }}>
          <img src="/logo.png" alt="VitaLens" style={{ width: 30, height: 30, objectFit: "contain" }} />
          VitaLens
        </div>
        <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 30, padding: 5, boxShadow: "0 1px 2px rgba(18,41,27,0.06)" }}>
          {NAV_ITEMS[lang].map((label, i) => (
            <span
              key={label}
              className="vl-swell"
              onClick={() => (i === 0 ? scrollToTop() : i === 1 ? scrollToAbout() : navigate("/app"))}
              style={{
                padding: "9px 16px",
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                background: i === 0 ? "#12291B" : "transparent",
                color: i === 0 ? "#EFF5EC" : "#41523F",
              }}
            >
              {label}
            </span>
          ))}
        </div>
        <button className="vl-swell" onClick={() => setLang(lang === "ru" ? "kz" : "ru")} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "none", borderRadius: 20, padding: "9px 16px", fontSize: 13.5, fontWeight: 500, color: "#41523F", cursor: "pointer" }}>
          <Globe size={14} /> {t.lang}
        </button>
      </div>

      {/* HERO */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1180, margin: "0 auto", padding: "10px 32px 40px", display: "flex", flexDirection: "column", minHeight: 640, overflow: "hidden" }}>
        <FloatingBackground />
        <div
          aria-hidden
          style={{
            position: "absolute", left: "50%", top: "46%", transform: "translate(-50%, -50%)",
            fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "clamp(56px, 11vw, 148px)",
            lineHeight: 0.88, color: "rgba(18,41,27,0.055)", textAlign: "center", userSelect: "none", zIndex: 0, whiteSpace: "nowrap",
          }}
        >
          VITA<br />LENS
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 20 }}>
          <div className="vl-enter" style={{ animationDelay: "0.05s", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 16, padding: "14px 18px", maxWidth: 220 }}>
            <span style={{ display: "inline-block", fontSize: 10.5, fontWeight: 600, color: "#1F8F5A", background: "#DCF2DE", padding: "3px 10px", borderRadius: 20, marginBottom: 10 }}>[ON]</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 700, fontSize: 40, color: "#12291B" }}>{statNum}%</span>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#1F8F5A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12 }}>↑</span>
            </div>
            <p style={{ fontSize: 12.5, color: "#5B6B58", lineHeight: 1.45, margin: "6px 0 0" }}>{t.statLeftLabel}</p>
          </div>

          <div className="vl-enter" style={{ animationDelay: "0.15s", background: "rgba(255,255,255,0.55)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.7)", borderRadius: 16, padding: "14px 18px", maxWidth: 200, textAlign: "right" }}>
            <div style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 700, fontSize: 32, color: "#12291B" }}>{statNum2}+</div>
            <p style={{ fontSize: 12, color: "#5B6B58", lineHeight: 1.45, margin: "6px 0 0" }}>{t.statRightLabel}</p>
          </div>
        </div>

        {/* центральный объект */}
        <div className="vl-enter" style={{ animationDelay: "0.1s", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 1, flex: 1, margin: "-10px 0" }}>
          <GlassOrb size={380} id="hero" />
        </div>

        <div className="vl-enter" style={{ animationDelay: "0.2s", position: "relative", zIndex: 1, maxWidth: 440 }}>
          <div className="vl-tagline" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.65)", backdropFilter: "blur(6px)", border: "1px solid rgba(31,143,90,0.18)", borderRadius: 20, padding: "9px 16px", fontSize: 13.5, fontWeight: 600, color: "#14713F", marginBottom: 22 }}>
            <Sparkles size={14} /> {t.tagline}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 30 }}>
            <button className="vl-btn-solid" onClick={() => navigate("/app")} style={{ border: "none", borderRadius: 12, padding: "14px 26px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, color: "#fff" }}>
              <Leaf className="vl-leaf-wiggle" size={16} /> {t.start} <span className="vl-arrow">→</span>
            </button>
          </div>
        </div>

        <div onClick={scrollToAbout} style={{ textAlign: "center", marginTop: "auto", paddingTop: 20, fontSize: 12, color: "#8A9A87", position: "relative", zIndex: 1, cursor: "pointer" }}>
          <span className="vl-chevron">⌄</span> {t.scroll}
        </div>
      </div>

      {/* ЦИТАТА */}
      <div className="vl-enter" style={{ animationDelay: "0.1s", position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "56px 32px 50px", textAlign: "center" }}>
        <div aria-hidden style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 46, fontWeight: 700, color: "#C7DFC5", marginBottom: 6 }}>&#8221;</div>
        <div style={{ fontSize: 20, fontWeight: 500, color: "#1E3A26", lineHeight: 1.55, fontStyle: "italic" }}>{t.quote}</div>
        <div style={{ width: 40, height: 2, background: "#1F8F5A", margin: "22px auto 0" }} />
      </div>

      {/* О ПРОЕКТЕ */}
      <div
        ref={aboutRef}
        style={{
          position: "relative", zIndex: 1, overflow: "hidden", padding: "92px 32px", color: "#EFF5EC",
          background: "radial-gradient(120% 100% at 15% 0%, #163524 0%, #0F2318 46%, #0A1B12 100%)",
        }}
      >
        {/* тонкая сетка поверх тёмного фона — убирает ощущение плоского цвета */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: 0.5,
          backgroundImage: "linear-gradient(rgba(143,227,107,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(143,227,107,0.05) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 100%)",
        }} />
        <div aria-hidden className="vl-blob" style={{ position: "absolute", width: 420, height: 420, top: -160, right: -120, borderRadius: "50%", background: "radial-gradient(circle,#37B36A,transparent 70%)", filter: "blur(90px)", opacity: 0.35, zIndex: 0, animationDuration: "22s" }} />
        <div aria-hidden className="vl-blob" style={{ position: "absolute", width: 340, height: 340, bottom: -120, left: -80, borderRadius: "50%", background: "radial-gradient(circle,#4FBF9E,transparent 70%)", filter: "blur(90px)", opacity: 0.3, zIndex: 0, animationDuration: "26s", animationDelay: "-6s" }} />
        <div aria-hidden style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: 1, background: "linear-gradient(90deg, transparent, rgba(143,227,107,0.5), transparent)", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 980, margin: "0 auto" }}>
          <div className="vl-enter" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#8FE36B", marginBottom: 16, fontSize: 12.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", background: "rgba(143,227,107,0.08)", border: "1px solid rgba(143,227,107,0.2)", borderRadius: 20, padding: "6px 14px" }}>
            <span className="vl-toast-dot" style={{ background: "#8FE36B" }} />
            <Leaf size={14} /><PawPrint size={14} /> {t.aboutTag}
          </div>
          <h2 className="vl-enter" style={{ animationDelay: "0.05s", fontFamily: "'Unbounded', sans-serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, margin: "0 0 44px", maxWidth: 680, lineHeight: 1.15 }}>
            <span style={{ background: "linear-gradient(120deg, #EFF5EC, #C9F2D2 60%, #8FE36B)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              {t.aboutTitle}
            </span>
          </h2>

          <div ref={cardsRef} style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 60 }}>
            {t.aboutCards.map((card, i) => (
              <div
                key={i}
                className="vl-project-card"
                style={{
                  flex: "1 1 260px", minWidth: 240, position: "relative", overflow: "hidden",
                  background: "linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "26px 24px",
                  opacity: cardsInView ? 1 : 0,
                  transform: cardsInView ? "translateY(0)" : "translateY(22px)",
                  transition: `opacity 0.6s ease ${i * 0.12}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s, border-color 0.25s ease, box-shadow 0.25s ease`,
                }}
              >
                <div className="vl-icon-badge" style={{
                  width: 46, height: 46, borderRadius: 13, marginBottom: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg, #1F8F5A, #0d3d22)",
                  boxShadow: "0 6px 18px rgba(31,143,90,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}>
                  <card.icon size={22} color="#EFF5EC" />
                </div>
                <div style={{ fontSize: 16.5, fontWeight: 600, marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 14, color: "#B9C7B4", lineHeight: 1.6 }}>{card.text}</div>
              </div>
            ))}
          </div>

          <div ref={metricsRef} className="vl-metrics-box" style={{ position: "relative", background: "linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "28px 30px", maxWidth: 480, overflow: "hidden" }}>
            <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #1F8F5A, #8FE36B, #4FBF9E)" }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "#8FE36B", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t.metricsTitle}
            </div>
            {t.metrics.map((m, i) => (
              <MetricBar key={i} label={m.label} value={m.value} active={metricsInView} index={i} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "34px 24px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#5B6B58", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(31,143,90,0.15)", borderRadius: 20, padding: "8px 16px" }}>
          🌿🐾 {t.footer}
        </span>
      </div>

      <style>{`
        .vl-blob { animation: vl-blob-float 18s ease-in-out infinite; }
        @keyframes vl-blob-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(22px, -18px) scale(1.06); }
          66% { transform: translate(-16px, 14px) scale(0.97); }
        }
        .vl-tagline { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .vl-tagline:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(31,143,90,0.14); }
        .vl-enter { opacity: 0; animation: vl-rise 0.6s ease-out forwards; }
        @keyframes vl-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .vl-swell { transition: transform 0.2s ease; display: inline-block; }
        .vl-swell:hover { transform: scale(1.06); }

        .vl-btn-outline { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, border-color 0.2s ease; }
        .vl-btn-outline:hover { transform: translateY(-2px) scale(1.03); border-color: #1F8F5A; box-shadow: 0 8px 18px rgba(31,143,90,0.14); }

        .vl-btn-solid {
          background: linear-gradient(120deg, #37B36A, #14713F, #37B36A);
          background-size: 200% 100%;
          background-position: 0% 0%;
          transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, background-position 0.6s ease;
        }
        .vl-btn-solid:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 10px 26px rgba(20,113,63,0.4);
          background-position: 100% 0%;
        }
        .vl-arrow { display: inline-block; transition: transform 0.2s ease; }
        .vl-btn-solid:hover .vl-arrow { transform: translateX(4px); }
        .vl-leaf-wiggle { transition: transform 0.3s ease; }
        .vl-btn-solid:hover .vl-leaf-wiggle { transform: rotate(-18deg) scale(1.1); }

        .vl-chevron { display: inline-block; animation: vl-chev 1.8s ease-in-out infinite; }
        @keyframes vl-chev { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }

        .vl-toast-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; animation: vl-pulse-dot 1.4s ease-in-out infinite; }
        @keyframes vl-pulse-dot { 0%, 100% { opacity: 0.4; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.2); } }

        .vl-project-card:hover {
          transform: translateY(-6px) !important;
          border-color: rgba(143,227,107,0.45) !important;
          box-shadow: 0 16px 36px rgba(0,0,0,0.35), 0 0 0 1px rgba(143,227,107,0.1);
        }
        .vl-project-card:hover .vl-icon-badge { transform: scale(1.08) rotate(-4deg); }
        .vl-icon-badge { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }

        .vl-metrics-box:hover { box-shadow: 0 16px 36px rgba(0,0,0,0.3); }
        .vl-metrics-box { transition: box-shadow 0.3s ease; }

        @media (prefers-reduced-motion: reduce) {
          .vl-enter { animation: none; opacity: 1; }
          .vl-swell:hover, .vl-btn-outline:hover, .vl-btn-solid:hover, .vl-leaf-wiggle, .vl-chevron, .vl-blob, .vl-toast-dot, .vl-project-card, .vl-icon-badge { animation: none !important; transform: none !important; transition: none !important; }
          .vl-project-card { opacity: 1 !important; }
        }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
