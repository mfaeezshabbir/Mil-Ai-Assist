import React from "react";

const SysLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <rect
      x="3.5"
      y="3.5"
      width="29"
      height="29"
      stroke="hsl(186 88% 48%)"
      strokeWidth="1.25"
    />
    <path
      d="M18 7.5V28.5M7.5 18H28.5"
      stroke="hsl(186 88% 48%)"
      strokeWidth="1"
      opacity="0.55"
    />
    <circle
      cx="18"
      cy="18"
      r="5.5"
      stroke="hsl(32 94% 52%)"
      strokeWidth="1.4"
    />
    <circle cx="18" cy="18" r="1.6" fill="hsl(32 94% 52%)" />
  </svg>
);

export default SysLogo;
