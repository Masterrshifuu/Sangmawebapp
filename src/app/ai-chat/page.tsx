
import { Bot } from 'lucide-react';
import SearchHeader from '@/components/SearchHeader';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AiChatPage() {
  return (
    <>
      <SearchHeader />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <Bot className="w-16 h-16 mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold">AI Chat Under Construction</h1>
        <p className="text-muted-foreground mt-2">
          This feature is temporarily unavailable as we work on some improvements.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Go Back Home</Link>
        </Button>
      </main>
    </>
  );
}
