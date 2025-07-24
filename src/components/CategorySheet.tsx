
'use client';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from './ui/button';
import { ChevronLeft } from 'lucide-react';

export function CategorySheet({ children }: { children: React.ReactNode }) {
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
          <DrawerTitle className="flex-1 text-center">All Categories</DrawerTitle>
          <div className="w-10 md:block hidden" />
        </DrawerHeader>
        <main className="container mx-auto px-4 py-8">
            <p className="text-muted-foreground text-center">This feature is coming soon.</p>
        </main>
      </DrawerContent>
    </Drawer>
  );
}
