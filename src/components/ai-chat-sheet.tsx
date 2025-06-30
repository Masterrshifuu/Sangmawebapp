'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Send, Loader2, User } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { chatShopping } from '@/ai/flows/chat-shopping';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AiChatSheet({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatShopping({ query: input });
      const aiMessage: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[86vh] flex flex-col p-0 rounded-t-2xl bg-card"
        showCloseButton={false}
      >
        <div className="flex justify-center py-3">
          <SheetClose>
            <div className="w-12 h-1.5 rounded-full bg-muted" />
          </SheetClose>
        </div>
        <SheetHeader className="px-4 pb-4 border-b text-center">
          <SheetTitle className="flex items-center justify-center gap-2">
            <Bot className="w-6 h-6" /> AI Shopping Assistant
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-xs md:max-w-md rounded-lg p-3 text-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <p>{message.content}</p>
                </div>
                 {message.role === 'user' && (
                  <Avatar className="w-8 h-8">
                     <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="user avatar" />
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground pt-16">
                  <Bot className="w-16 h-16 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">AI Shopping Assistant</h3>
                  <p className="text-sm">Ask me anything about our products, and I'll help you find what you need!</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, offers, etc."
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
