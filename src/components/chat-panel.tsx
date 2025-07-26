
'use client';

import { useState } from 'react';
import type { AIState } from '@/lib/types';
import { getChatResponse } from '@/app/actions';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { ArrowUp } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { ProductCard } from './product-card';

type ChatMessage = AIState[number] & {
    productContext?: { name: string; description: string };
};

export function ChatPanel({ productContext }: { productContext?: { name: string, description: string } }) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputValue,
    };
    
    // Add product context to the first user message if it exists
    if (messages.length === 0 && productContext) {
        userMessage.productContext = productContext;
    }

    const newMessages: ChatMessage[] = [
      ...messages,
      userMessage,
    ];

    setMessages(newMessages);
    setInputValue('');

    const responseMessage = await getChatResponse(newMessages);
    setMessages(currentMessages => [...currentMessages, responseMessage]);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && productContext && (
            <div className="p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                <p className="font-semibold">Ask me anything about {productContext.name}!</p>
                <p>For example: "Is this good for breakfast?" or "What are the ingredients?"</p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-lg max-w-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p>{message.content}</p>
              </div>
              {message.products && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {message.products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={productContext ? `Ask about ${productContext.name}` : "Ask about products or deals..."}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!inputValue.trim()}>
            <ArrowUp className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
