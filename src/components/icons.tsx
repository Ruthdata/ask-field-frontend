export const MailIcon = () => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Dark circle background */}
      <circle cx="40" cy="40" r="40" fill="#2D2D2D" />
      {/* Yellow rounded envelope */}
      <rect x="16" y="24" width="48" height="34" rx="8" fill="#F5A623" />
      {/* Envelope flap / M shape */}
      <path d="M16 30l24 16 24-16" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Green checkmark badge */}
      <circle cx="56" cy="56" r="12" fill="#22C55E" />
      <path d="M51 56l3.5 3.5L61 51" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  export const EyeIcon = ({ open }: { open: boolean }) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );