import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 28 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7033ff" />
          <stop offset="100%" stopColor="#9b5cff" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#logo-bg)" />
      {/* Prompt chevron > */}
      <path d="M8 10l6 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Cursor underscore _ */}
      <path d="M17 22h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}
