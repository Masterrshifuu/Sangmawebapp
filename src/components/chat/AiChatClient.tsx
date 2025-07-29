
'use client';

import { Bot } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export function AiChatClient() {
  return (
    <div className="relative flex flex-col h-screen bg-background">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-2 md:p-4 h-[65px]">
             <div className="w-10"></div>
            <div className="font-semibold font-headline text-lg">Sangma AI</div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/">
                    <Home />
                    <span className="sr-only">Home</span>
                  </Link>
                </Button>
            </div>
        </header>

         <main className="flex flex-col items-center justify-center flex-1 text-center p-4">
            <Bot className="w-16 h-16 mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold">AI Chat Under Construction</h1>
            <p className="text-muted-foreground mt-2">
              This feature is temporarily unavailable. Please check back later.
            </p>
        </main>
    </div>
  );
}
