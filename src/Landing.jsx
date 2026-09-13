import { useNavigate } from "react-router-dom";
import { Camera, MessageSquareText, ShieldCheck, Leaf, PawPrint, BookOpen, Sprout } from "lucide-react";

// Простые "плавающие споры" на фоне — декоративный, но не навязчивый штрих,
// перекликающийся с темой (пыльца/споры в поле). Позиции и задержки заданы
// один раз при монтировании, движение мягкое и медленное.
const SPORES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 3 + (i % 4),
  duration: 18 + (i % 7) * 3,
  delay: -(i * 2.3),
}));

function Spores() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {SPORES.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            bottom: -10,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "rgba(201, 138, 43, 0.35)",
            animation: `bioai-float ${s.duration}s linear infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function FeatureCard({ Icon, title, text, delay }) {
  return (
    <div
      className="bioai-reveal"
      style={{
        animationDelay: `${delay}s`,
        background: "#EFE8D8",
        borderRadius: 12,
        padding: "26px 24px",
        flex: "1 1 240px",
        minWidth: 240,
      }}
    >
      <Icon size={22} color="#8A5A20" style={{ marginBottom: 14 }} />
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: "#2A2118", marginBottom: 8, fontWeight: 600 }}>
        {title}
      </div>
      <div style={{ fontSize: 14.5, color: "#5B5041", lineHeight: 1.55 }}>{text}</div>
    </div>
  );
}

function StepRow({ number, title, text, delay }) {
  return (
    <div className="bioai-reveal" style={{ animationDelay: `${delay}s`, display: "flex", gap: 18, alignItems: "flex-start" }}>
      <div
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 22,
          color: "#C98A2B",
          border: "1.5px solid #3A4A3D",
          borderRadius: "50%",
          width: 44,
          height: 44,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {number}
      </div>
      <div>
        <div style={{ fontSize: 16.5, color: "#F1ECDF", fontWeight: 600, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 14.5, color: "#9CB89C", lineHeight: 1.55, maxWidth: 480 }}>{text}</div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "#16241C", fontFamily: "'IBM Plex Sans', sans-serif", color: "#F1ECDF", overflowX: "hidden" }}>
      {/* HERO */}
      <div style={{ position: "relative", padding: "88px 24px 100px", textAlign: "center" }}>
        <Spores />
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <div className="bioai-reveal" style={{ animationDelay: "0s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#C98A2B", marginBottom: 18 }}>
            <Sprout size={20} />
            <span style={{ fontSize: 13.5, color: "#9CB89C", letterSpacing: "0.02em" }}>полевой журнал наблюдений</span>
          </div>
          <h1
            className="bioai-reveal"
            style={{ animationDelay: "0.12s", fontFamily: "'Fraunces', serif", fontSize: "clamp(44px, 8vw, 76px)", fontWeight: 600, margin: "0 0 20px", lineHeight: 1.05 }}
          >
            BioAI
          </h1>
          <p className="bioai-reveal" style={{ animationDelay: "0.24s", fontSize: 18, color: "#B9C7B4", lineHeight: 1.6, maxWidth: 540, margin: "0 auto 36px" }}>
            Сфотографируй растение или питомца, опиши, что не так — и получи предварительную
            оценку состояния с рекомендациями, основанными на проверенных источниках.
          </p>
          <button
            className="bioai-reveal"
            onClick={() => navigate("/app")}
            style={{
              animationDelay: "0.36s",
              background: "#C98A2B",
              color: "#1A150E",
              border: "none",
              borderRadius: 9,
              padding: "15px 34px",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(201, 138, 43, 0.25)",
            }}
          >
            Открыть приложение
          </button>
        </div>
      </div>

      {/* ЧТО ЭТО */}
      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 24px 80px", display: "flex", flexWrap: "wrap", gap: 18 }}>
        <FeatureCard
          Icon={Camera}
          title="Фото + симптомы"
          text="Загружаешь снимок листа или питомца и своими словами описываешь, что заметил — программа анализирует и то, и другое вместе."
          delay={0.1}
        />
        <FeatureCard
          Icon={BookOpen}
          title="Проверенные источники"
          text="Ответы опираются на базу знаний, собранную из сельскохозяйственных расширений университетов и ветеринарных ресурсов, а не только на общие догадки ИИ."
          delay={0.2}
        />
        <FeatureCard
          Icon={ShieldCheck}
          title="Растёт вместе с пользователями"
          text="Любой может предложить новый источник — ИИ сначала проверяет его надёжность, и только после подтверждения запись попадает в общую базу."
          delay={0.3}
        />
      </div>

      {/* КАК ЭТО РАБОТАЕТ */}
      <div style={{ background: "#121D16", padding: "72px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          <div className="bioai-reveal" style={{ animationDelay: "0s", display: "flex", gap: 10, alignItems: "center", color: "#C98A2B", marginBottom: 4 }}>
            <Leaf size={16} />
            <PawPrint size={16} />
            <span style={{ fontSize: 13.5, color: "#9CB89C" }}>как это работает</span>
          </div>
          <StepRow number="1" title="Сфотографируй и опиши" text="Снимок растения или животного плюс пара предложений о том, что не так — фото можно и пропустить, если под рукой только слова." delay={0.05} />
          <StepRow number="2" title="ИИ анализирует по базе знаний" text="Модель сопоставляет фото и описание с базой известных болезней и их источниками, а не просто гадает." delay={0.15} />
          <StepRow number="3" title="Получи причины и рекомендации" text="Список вероятных причин с процентами уверенности, обнаруженные признаки и конкретные шаги — что делать дальше." delay={0.25} />
        </div>
      </div>

      <div style={{ textAlign: "center", color: "#6B7A68", fontSize: 12.5, padding: "28px 24px" }}>
        Предварительный анализ не заменяет консультацию агронома или ветеринара.
      </div>

      <style>{`
        .bioai-reveal {
          opacity: 0;
          animation: bioai-rise 0.6s ease-out forwards;
        }
        @keyframes bioai-rise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bioai-float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-620px) translateX(24px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .bioai-reveal { animation: none; opacity: 1; }
          [style*="bioai-float"] { animation: none !important; }
        }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
