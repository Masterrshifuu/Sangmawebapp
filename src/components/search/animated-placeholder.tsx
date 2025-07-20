
'use client';

import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

const messages = [
  'Search for Products..',
  'Free delivery on orders over ₹1000 in South Tura',
  'Free delivery on orders over ₹1000 in North Tura',
  'Free delivery on orders over ₹3000 in Tura NEHU',
  'Search for Products..', // Repeat first message for smooth loop
];

export function AnimatedPlaceholder({
  isInput = false,
  ...props
}: { isInput?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  if (isInput) {
    return (
      <div
        className="absolute top-1/2 left-10 -translate-y-1/2 h-full w-[calc(100%-3rem)] pointer-events-none"
        {...props}
      >
        <div className="h-full w-full overflow-hidden relative">
          <div className="animate-slide-up absolute inset-0 flex flex-col justify-around text-muted-foreground text-sm">
            {messages.map((msg, i) => (
              <span key={i} className="h-full flex items-center">{msg}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      className={cn(
        'flex items-center w-full h-11 rounded-lg bg-background shadow-sm px-4 text-left text-sm text-muted-foreground active:bg-secondary/80',
        props.className
      )}
    >
      <Search className="h-5 w-5 mr-3" />
      <div className="flex-1 h-5 overflow-hidden relative">
        <div className="animate-slide-up absolute inset-0 flex flex-col justify-around">
          {messages.map((msg, i) => (
            <span key={i}>{msg}</span>
          ))}
        </div>
      </div>
    </button>
  );
}
