
'use client';

import * as React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export function HorizontalScroller({ children }: { children: React.ReactNode }) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="px-4">{children}</div>
      <ScrollBar orientation="horizontal" className="h-2.5" />
    </ScrollArea>
  );
}
