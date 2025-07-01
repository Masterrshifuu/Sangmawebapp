'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Send, Loader2, User } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';
import type { Product, Message } from '@/lib/types';
import ProductCard from './product-card';

export default function AiChatSheet({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = newMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(({ role, content }) => ({ role, content }));
      
      const res = await fetch('/api/chat-shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, history: historyForApi }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ details: `API request failed with status ${res.status}` }));
        throw new Error(errorData.details || 'The AI assistant is currently unavailable.');
      }

      const result = await res.json();
      
      if (!result || typeof result.response !== 'string' || result.response.trim() === '') {
          throw new Error('Received an invalid or empty response from the server.');
      }
      
      const aiMessage: Message = { 
        role: 'assistant', 
        content: result.response, 
        products: result.recommendedProducts || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
      
    } catch (error) {
      const errorMessageContent = error instanceof Error ? error.message : "Sorry, I'm having trouble connecting. Please try again later.";
      const errorMessage: Message = {
        role: 'assistant',
        content: errorMessageContent,
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
        className="h-[75vh] flex flex-col p-0 rounded-t-2xl bg-card"
        showCloseButton={false}
      >
        <SheetTitle className="sr-only">AI Shopping Assistant</SheetTitle>
        <div className="flex justify-center py-3 border-b">
          <SheetClose>
            <div className="w-12 h-1.5 rounded-full bg-muted" />
          </SheetClose>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages
              .filter(m => m && typeof m.content === 'string' && m.content.trim() !== '')
              .map((message, index) => {
              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : ''
                  )}
                >
                  {message.role === 'user' ? (
                    <div className="max-w-xs md:max-w-md rounded-lg p-3 text-sm bg-primary text-primary-foreground">
                      <p>{message.content}</p>
                    </div>
                  ) : (
                    <div className="w-full">
                      <p className="text-sm text-foreground max-w-full whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.products && message.products.length > 0 && (
                        <div className="mt-4">
                           <h4 className="font-bold mb-2 text-sm">Recommended Products:</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {message.products.map((product) => (
                              <ProductCard key={product.id} product={product} size="small" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                   {message.role === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
             {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <p className="text-sm text-muted-foreground animate-pulse">
                  Ai Chanchienga is thinking...
                </p>
              </div>
            )}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground pt-16">
                  <Bot className="w-16 h-16 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">AI Shopping Assistant</h3>
                  <p className="text-sm">Ask me to find products, or tell me what you're looking for!</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background flex items-center gap-2">
            <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 'shampoo for dry hair'"
                autoComplete="off"
                disabled={isLoading}
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
