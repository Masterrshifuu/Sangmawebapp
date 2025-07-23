
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ChatPanel } from './chat-panel';

export function AiChatSheet({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-full flex flex-col p-0"
        showCloseButton={false}
      >
        <div className="flex justify-center py-3">
            <div className="w-12 h-1.5 rounded-full bg-muted" />
        </div>
        <SheetHeader className="p-4 pt-0 text-center">
          <SheetTitle>AI Shopping Assistant</SheetTitle>
        </SheetHeader>
        <ChatPanel />
      </SheetContent>
    </Sheet>
  );
}
