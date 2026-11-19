interface IraqFlagProps {
  className?: string;
}

export function IraqFlag({ className = 'w-6 h-4' }: IraqFlagProps) {
  return (
    <span
      className="inline-flex items-center justify-center shrink-0 rounded-[4px] overflow-hidden border border-slate-300 dark:border-slate-600"
      title="علم جمهورية العراق"
    >
      <svg className={className} viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="900" height="200" fill="#CE1126" />
        <rect y="200" width="900" height="200" fill="#FFFFFF" />
        <rect y="400" width="900" height="200" fill="#000000" />
        <text
          x="450"
          y="342"
          fill="#007A3D"
          fontFamily="Cairo, Arial, sans-serif"
          fontWeight="900"
          fontSize="118"
          textAnchor="middle"
        >
          الله أكبر
        </text>
      </svg>
    </span>
  );
}
