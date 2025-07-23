
'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ChatPanel } from './chat-panel';

export function AiChatSheet({ children }: { children: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        className="h-full flex flex-col p-0"
      >
        <DrawerHeader className="p-4 pt-0 text-center">
          <DrawerTitle>AI Shopping Assistant</DrawerTitle>
        </DrawerHeader>
        <ChatPanel />
      </DrawerContent>
    </Drawer>
  );
}
