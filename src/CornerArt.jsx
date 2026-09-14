export default function CornerArt() {
  return (
    <svg
      viewBox="0 0 340 340"
      width="340"
      height="340"
      fill="none"
      style={{
        position: "absolute",
        bottom: -30,
        right: -30,
        zIndex: 0,
        opacity: 0.55,
        WebkitMaskImage: "linear-gradient(315deg, black 15%, transparent 70%)",
        maskImage: "linear-gradient(315deg, black 15%, transparent 70%)",
      }}
    >
      <g stroke="#12291B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
        {/* кот */}
        <path d="M120 260c-10-30-6-60 20-78 4-12 12-20 22-20 4-10 14-16 22-12 8-14 24-16 30-2 14 2 20 16 14 28 10 10 8 26-4 32 2 14-8 26-22 24-6 12-22 16-32 8-14 8-32 4-38-10-8 2-14-2-12-10-2 8 0 22 0 40Z" />
        <circle cx="176" cy="176" r="3.5" fill="#12291B" stroke="none" />
        <circle cx="198" cy="168" r="3.5" fill="#12291B" stroke="none" />
        <path d="M186 190c4 4 10 4 14 0" />
        {/* собака */}
        <path d="M70 300c-4-22 6-40 26-46 2-10 10-16 18-12 6-10 18-10 22 2 12 0 16 12 10 20 6 10 0 22-12 24 0 10-10 16-20 12-8 8-20 4-24-6-8 2-14 0-14-8-4 6-4 10-6 14Z" />
        <path d="M92 244l-6-14M108 240l-2-16M124 244l4-14" />
      </g>
    </svg>
  );
}
