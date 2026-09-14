import { Leaf } from "lucide-react";

const PawIcon = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <ellipse cx="12" cy="16.5" rx="5" ry="4.2" />
    <circle cx="5.5" cy="9" r="2.1" />
    <circle cx="10" cy="6" r="2.1" />
    <circle cx="14" cy="6" r="2.1" />
    <circle cx="18.5" cy="9" r="2.1" />
  </svg>
);

const ITEMS = Array.from({ length: 22 }, (_, i) => {
  const kind = i % 3; // 0 leaf, 1 paw, 2 dot
  return {
    kind,
    left: (i * 19 + (i % 5) * 13) % 100,
    size: kind === 2 ? 5 + (i % 3) * 2 : 13 + (i % 3) * 4,
    duration: 22 + (i % 6) * 4,
    delay: -(i * 2.7),
    dx: (i % 2 === 0 ? 1 : -1) * (18 + (i % 5) * 8),
    rot: (i % 2 === 0 ? 1 : -1) * (35 + (i % 4) * 30),
    opacity: kind === 0 ? 0.55 : kind === 1 ? 0.45 : 0.3,
  };
});

export default function FloatingBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {ITEMS.map((it, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${it.left}%`,
            bottom: -40,
            opacity: 0,
            animation: `vl-drift ${it.duration}s linear infinite`,
            animationDelay: `${it.delay}s`,
            "--dx": `${it.dx}px`,
            "--rot": `${it.rot}deg`,
          }}
        >
          {it.kind === 0 && <Leaf size={it.size} color="#8FE36B" style={{ opacity: it.opacity }} />}
          {it.kind === 1 && <PawIcon size={it.size} color="#79D95E" />}
          {it.kind === 2 && <div style={{ width: it.size, height: it.size, borderRadius: "50%", background: "#8FE36B", opacity: it.opacity }} />}
        </div>
      ))}
      <style>{`
        @keyframes vl-drift {
          0% { transform: translate(0,0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate(var(--dx), -720px) rotate(var(--rot)); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="vl-drift"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
