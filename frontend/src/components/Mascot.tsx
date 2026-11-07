export default function Mascot({ className = "", talking = false }: { className?: string; talking?: boolean }) {
  return (
    <svg className={`mascot ${talking ? "talking" : ""} ${className}`} viewBox="0 0 220 230" aria-hidden="true">
      <ellipse className="shadow" cx="110" cy="214" rx="48" ry="8" fill="#1f7a34" opacity="0.18" />
      <g className="agent">
        <g className="leg left">
          <rect x="90" y="168" width="14" height="32" rx="7" fill="#17662c" />
        </g>
        <g className="leg right">
          <rect x="116" y="168" width="14" height="32" rx="7" fill="#17662c" />
        </g>
        <g className="arm left">
          <rect x="48" y="108" width="28" height="10" rx="5" fill="#f0b15d" />
        </g>
        <g className="arm right">
          <rect x="146" y="102" width="30" height="10" rx="5" fill="#f0b15d" />
        </g>
        <g className="body">
          <rect x="72" y="92" width="76" height="82" rx="22" fill="#1f7a34" />
          <rect x="86" y="112" width="48" height="36" rx="12" fill="#16632c" />
          <path d="M110 118l7 3v6c0 5-3 8.4-7 10-4-1.6-7-5-7-10v-6l7-3z" fill="none" stroke="#d7efe0" strokeWidth="2" />
        </g>
        <g className="head">
          <circle cx="110" cy="62" r="34" fill="#f6b15a" />
          <circle cx="110" cy="62" r="34" fill="none" stroke="#e07a2f" strokeWidth="3" />
          <circle cx="92" cy="74" r="5" fill="#f4a07a" opacity="0.7" />
          <circle cx="130" cy="74" r="5" fill="#f4a07a" opacity="0.7" />
          <g className="eye left">
            <ellipse cx="98" cy="60" rx="7" ry="8" fill="#fff" />
            <circle className="pupil" cx="99" cy="62" r="3.3" fill="#16321f" />
            <ellipse className="lid" cx="98" cy="60" rx="8" ry="9" fill="#f6b15a" />
          </g>
          <g className="eye right">
            <ellipse cx="124" cy="60" rx="7" ry="8" fill="#fff" />
            <circle className="pupil" cx="125" cy="62" r="3.3" fill="#16321f" />
            <ellipse className="lid" cx="124" cy="60" rx="8" ry="9" fill="#f6b15a" />
          </g>
          <path className="mouth" d="M100 76q10 8 22 0" fill="none" stroke="#c45c28" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
