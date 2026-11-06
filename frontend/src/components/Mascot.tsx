export default function Mascot({ className = "" }: { className?: string }) {
  return (
    <svg className={`mascot ${className}`} viewBox="0 0 220 210" aria-hidden="true">
      <circle cx="48" cy="46" r="42" fill="#d7efe0" opacity="0.9" />
      <circle cx="176" cy="38" r="36" fill="#d7efe0" opacity="0.75" />
      <circle cx="110" cy="52" r="28" fill="#f6b15a" stroke="#e07a2f" strokeWidth="3" />
      <rect x="74" y="78" width="72" height="68" rx="10" fill="#1f7a34" />
      <circle cx="110" cy="108" r="16" fill="#f4fff6" />
      <path
        d="M110 98.5l8 3.2v6.4c0 6.2-3.4 10.4-8 12.4-4.6-2-8-6.2-8-12.4v-6.4l8-3.2z"
        fill="none"
        stroke="#1f7a34"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <rect x="58" y="104" width="22" height="7" rx="3.5" fill="#f0b15d" />
      <rect x="140" y="104" width="22" height="7" rx="3.5" fill="#f0b15d" />
      <rect x="92" y="154" width="12" height="26" rx="4" fill="#1f7a34" />
      <rect x="116" y="154" width="12" height="26" rx="4" fill="#1f7a34" />
    </svg>
  );
}
