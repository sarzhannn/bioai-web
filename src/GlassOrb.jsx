// Единый стеклянный шар вместо цветка : внутри знаки листа и лапки живут
// в одной форме, а не приклеены друг к другу. Плюс несколько маленьких
// спутников по орбите для лёгкой, живой анимации вокруг главного объекта.

function LeafPawMark({ size }) {
  // Две отдельные, ясно читаемые метки внутри шара: лист слева (белый, со
  // жилкой и черешком), лапка справа (тёплый кремовый тон) : разный цвет и
  // заметный зазор между ними, чтобы силуэты не сливались в одно пятно.
  const s = size;
  return (
    <g transform={`translate(${-s / 2} ${-s / 2})`}>
      {/* лист */}
      <g transform={`translate(${s * 0.06} ${s * 0.08}) rotate(-8)`} fill="rgba(255,255,255,0.96)">
        <path d={`M0 ${s * 0.5}
          C${-s * 0.06} ${s * 0.3}, ${s * 0.02} ${s * 0.08}, ${s * 0.32} 0
          C${s * 0.4} ${s * 0.2}, ${s * 0.34} ${s * 0.42}, ${s * 0.16} ${s * 0.52}
          C${s * 0.1} ${s * 0.56}, ${s * 0.04} ${s * 0.55}, 0 ${s * 0.5}Z`} />
        {/* центральная жилка */}
        <path d={`M${s * 0.02} ${s * 0.47} C${s * 0.1} ${s * 0.32}, ${s * 0.18} ${s * 0.18}, ${s * 0.29} ${s * 0.04}`}
          fill="none" stroke="rgba(31,143,90,0.55)" strokeWidth={s * 0.012} strokeLinecap="round" />
        {/* черешок */}
        <path d={`M${-s * 0.02} ${s * 0.5} C${-s * 0.06} ${s * 0.58}, ${-s * 0.05} ${s * 0.66}, ${-s * 0.01} ${s * 0.7}`}
          fill="none" stroke="rgba(255,255,255,0.96)" strokeWidth={s * 0.035} strokeLinecap="round" />
      </g>

      {/* лапка, смещена дальше вправо и вниз для явного разделения */}
      <g transform={`translate(${s * 0.72} ${s * 0.56})`} fill="#FFE9A8">
        <ellipse cx={0} cy={s * 0.16} rx={s * 0.145} ry={s * 0.12} />
        <circle cx={-s * 0.155} cy={-s * 0.03} r={s * 0.06} />
        <circle cx={-s * 0.045} cy={-s * 0.125} r={s * 0.065} />
        <circle cx={s * 0.075} cy={-s * 0.125} r={s * 0.065} />
        <circle cx={s * 0.185} cy={-s * 0.03} r={s * 0.06} />
      </g>
    </g>
  );
}

function SatelliteOrb({ cx, cy, r, c1, c2, delay, duration }) {
  const gradId = `sat-${cx}-${cy}-${r}`.replace(/\./g, "");
  return (
    <g
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        animation: `vl-bob ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${gradId})`} stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" />
      <ellipse cx={cx - r * 0.3} cy={cy - r * 0.35} rx={r * 0.28} ry={r * 0.32} fill="rgba(255,255,255,0.55)" />
    </g>
  );
}

export default function GlassOrb({ size = 380, id = "orb" }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.3;

  const satellites = [
    { dx: -0.72, dy: -0.5, r: size * 0.052, c1: "#EBFFCF", c2: "#3FAE45", delay: 0, duration: 5.5 },
    { dx: 0.78, dy: -0.42, r: size * 0.038, c1: "#B4F0D9", c2: "#0E7A6B", delay: 0.6, duration: 6.2 },
    { dx: 0.62, dy: 0.62, r: size * 0.045, c1: "#C6FF8A", c2: "#2E9B4C", delay: 1.1, duration: 5.8 },
    { dx: -0.6, dy: 0.58, r: size * 0.03, c1: "#8CE3A6", c2: "#177A4F", delay: 1.6, duration: 6.6 },
  ];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EBFFCF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#EBFFCF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-main`} cx="32%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#EBFFCF" />
          <stop offset="35%" stopColor="#79D95E" />
          <stop offset="75%" stopColor="#1F8F5A" />
          <stop offset="100%" stopColor="#0B5C3E" />
        </radialGradient>
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy={size * 0.02} stdDeviation={size * 0.02} floodColor="#0B3D24" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* мягкое свечение позади */}
      <circle cx={cx} cy={cy} r={size * 0.46} fill={`url(#${id}-glow)`} />

      {/* тонкое орбитальное кольцо для лёгкости композиции */}
      <ellipse cx={cx} cy={cy} rx={r * 1.55} ry={r * 0.55} fill="none" stroke="rgba(31,143,90,0.18)" strokeWidth="1.2" strokeDasharray="2 6" transform={`rotate(-18 ${cx} ${cy})`} />

      {/* спутники по орбите : маленькая живая анимация */}
      {satellites.map((s, i) => (
        <SatelliteOrb key={i} cx={cx + s.dx * r * 1.5} cy={cy + s.dy * r * 1.1} r={s.r} c1={s.c1} c2={s.c2} delay={s.delay} duration={s.duration} />
      ))}

      {/* главный стеклянный шар */}
      <g filter={`url(#${id}-shadow)`}>
        <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-main)`} stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" />
        {/* блик */}
        <ellipse cx={cx - r * 0.35} cy={cy - r * 0.4} rx={r * 0.32} ry={r * 0.4} fill="rgba(255,255,255,0.55)" />
        <ellipse cx={cx - r * 0.4} cy={cy - r * 0.45} rx={r * 0.1} ry={r * 0.14} fill="rgba(255,255,255,0.85)" />
        {/* нижний тёплый рефлекс : добавляет объём */}
        <ellipse cx={cx + r * 0.3} cy={cy + r * 0.5} rx={r * 0.5} ry={r * 0.25} fill="rgba(11,92,62,0.35)" />
      </g>

      {/* знак листа+лапки внутри шара */}
      <g transform={`translate(${cx} ${cy})`}>
        <LeafPawMark size={r * 1.1} />
      </g>

      <style>{`
        @keyframes vl-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="vl-bob"] { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}
