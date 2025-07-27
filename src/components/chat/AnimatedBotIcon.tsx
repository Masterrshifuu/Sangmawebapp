
'use client';

import { cn } from '@/lib/utils';

export const AnimatedBotIcon = ({ className }: { className?: string }) => {
  return (
    <>
      <style>{`
        @keyframes bot-antenna-wiggle {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes bot-eye-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .bot-antenna {
          transform-origin: bottom center;
          animation: bot-antenna-wiggle 3s ease-in-out infinite;
        }
        .bot-eye {
            transform-origin: center;
            animation: bot-eye-blink 4s linear infinite;
        }
      `}</style>
      <div className={cn("relative w-20 h-20 rounded-full flex items-center justify-center bg-[#F6FF21]", className)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-black"
        >
          <path d="M12 8V4H8" />
          <path d="M16 4h-4" className="bot-antenna" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
           <circle cx="12" cy="14" r="1.5" className="bot-eye" fill="black" />
        </svg>
      </div>
    </>
  );
};
