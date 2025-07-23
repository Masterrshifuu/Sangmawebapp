
'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

export function TrackingSheet({ children }: { children: React.ReactNode }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        className="h-full flex flex-col p-0"
      >
        <DrawerHeader className="p-4 pt-0 text-center">
          <DrawerTitle>Track Your Order</DrawerTitle>
        </DrawerHeader>
        <main className="container mx-auto px-4 py-8">
            <p className="text-muted-foreground text-center">This feature is coming soon.</p>
        </main>
      </DrawerContent>
    </Drawer>
  );
}
