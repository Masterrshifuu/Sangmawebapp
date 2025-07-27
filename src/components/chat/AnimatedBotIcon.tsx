
'use client';

import { cn } from '@/lib/utils';

export const AnimatedBotIcon = ({ className }: { className?: string }) => {
  return (
    <>
      <style>{`
        @keyframes bot-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes bot-antenna-wiggle {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes bot-eye-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .bot-body {
            animation: bot-bob 4s ease-in-out infinite;
        }
        .bot-antenna {
          transform-origin: bottom center;
          animation: bot-antenna-wiggle 2.5s ease-in-out infinite;
        }
        .bot-eye {
            transform-origin: center;
            animation: bot-eye-blink 4s linear infinite;
        }
      `}</style>
      <div className={cn("relative w-20 h-20 rounded-full flex items-center justify-center bg-[#F6FF21]", className)}>
        <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="bot-body"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 13H9" className="bot-eye" />
            <path d="M12 10V8" className="bot-antenna" />
            <path d="M12 8m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" fill="black" stroke="none" />
            <rect x="5" y="10" width="14" height="10" rx="2" />
        </svg>
      </div>
    </>
  );
};
