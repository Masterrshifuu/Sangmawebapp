
'use client';
import { Bot } from 'lucide-react';

export default function AiChatTab() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-background">
      <Bot className="w-24 h-24 mb-6 text-muted-foreground" />
      <h1 className="text-2xl font-bold font-headline mb-2">AI Shopping Assistant</h1>
      <p className="text-muted-foreground max-w-sm">
        This feature is coming soon! Get ready for a new way to shop with personalized AI-powered conversations.
      </p>
    </div>
  );
}
