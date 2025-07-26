
'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { ChatPanel } from '@/components/chat-panel';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface AiChatSheetProps {
    children: React.ReactNode;
    productContext?: {
        name: string;
        description: string;
    }
}

export function AiChatSheet({ children, productContext }: AiChatSheetProps) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        className="h-full md:h-[80vh] flex flex-col p-0"
      >
        <DrawerHeader className="p-4 pt-4 text-center flex items-center justify-between">
           <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="md:flex hidden">
                    <ChevronLeft />
                    <span className="sr-only">Back</span>
                </Button>
            </DrawerClose>
          <DrawerTitle className="flex-1 text-center">AI Shopping Assistant</DrawerTitle>
           <div className="w-10 md:block hidden" />
        </DrawerHeader>
        <ChatPanel productContext={productContext} />
      </DrawerContent>
    </Drawer>
  );
}
