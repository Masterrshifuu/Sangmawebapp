
'use client';

import { useState } from 'react';
import type { AIState } from '@/lib/types';
import { getChatResponse } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp, Bot, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMessageDisplay } from '@/components/chat/ChatMessageDisplay';
import { EmptyChat } from '@/components/chat/EmptyChat';

type ChatMessage = AIState[number] & {
    productContext?: { name: string; description: string };
};

export default function AiChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputValue,
    };
    
    const newMessages: ChatMessage[] = [
      ...messages,
      userMessage,
    ];

    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
        const responseMessage = await getChatResponse(newMessages);
        setMessages(currentMessages => [...currentMessages, responseMessage]);
    } catch (error) {
        console.error("Failed to get chat response:", error);
        const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.'
        };
        setMessages(currentMessages => [...currentMessages, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden md:flex flex-col w-64 border-r">
          <ChatSidebar />
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b p-2 md:p-4 h-[65px]">
            <div className="flex items-center gap-2">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu />
                            <span className="sr-only">Open Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                       <SheetTitle className="sr-only">Chat History</SheetTitle>
                       <ChatSidebar />
                    </SheetContent>
                </Sheet>
                 <div className="font-semibold"></div>
            </div>
        </header>

        <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto px-4">
                    {messages.length === 0 ? (
                        <EmptyChat setInputValue={setInputValue} />
                    ) : (
                        <div className="divide-y">
                            {messages.map((message) => (
                                <ChatMessageDisplay key={message.id} message={message} />
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-4 py-6">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        <Bot />
                                    </div>
                                    <div className="pt-2">
                                        <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>
            
            <div className="w-full max-w-4xl mx-auto p-4 bg-background/80 backdrop-blur-sm md:bg-transparent pb-20 md:pb-4">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about products.."
                  className="pr-12 py-3 h-12 min-h-12 resize-none focus-visible:ring-1 focus-visible:ring-accent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  rows={1}
                />
                <Button 
                    type="submit" 
                    size="icon"
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 bottom-2 h-8 w-8 bg-accent hover:bg-accent/80 disabled:bg-muted"
                >
                  <ArrowUp className="h-5 w-5 text-black" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
              <p className="text-xs text-center text-muted-foreground mt-2 transform scale-90 origin-center">
                AI responses may not always be accurate. Check product details for final information.
              </p>
            </div>
        </div>
      </main>
    </div>
  );
}
