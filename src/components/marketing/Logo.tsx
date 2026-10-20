/** The joinStudy mark. 24px by default; marketing CSS may size it differently. */
export const LogoMark = ({ className = "h-6 w-6 flex-none" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <circle cx="12" cy="12" r="11" fill="#f0c93a" />
    <circle cx="12" cy="12" r="4.4" fill="#120e22" />
  </svg>
);
