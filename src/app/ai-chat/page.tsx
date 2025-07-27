
'use client';

import { useState } from 'react';
import type { AIState, Product } from '@/lib/types';
import { getChatResponse } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductCard } from '@/components/product-card';
import Image from 'next/image';
import { ArrowUp, Bot, Plus, Search, MessageSquare, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useLocation } from '@/hooks/use-location';

type ChatMessage = AIState[number] & {
    productContext?: { name: string; description: string };
};


const Sidebar = () => {
    const { user } = useAuth();
    const { location } = useLocation();

    return (
        <aside className="hidden md:flex flex-col w-64 bg-secondary/30 p-2">
            <div className="p-2">
                <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2" /> New Chat
                </Button>
            </div>
            <ScrollArea className="flex-1 my-2">
                <div className="px-2 space-y-1">
                    {/* Placeholder for previous chats */}
                    <p className="px-2 py-1 text-xs text-muted-foreground font-semibold">Today</p>
                    <button className="w-full text-left text-sm p-2 rounded-md hover:bg-secondary truncate">
                        Recommendations for {location}
                    </button>
                    <button className="w-full text-left text-sm p-2 rounded-md hover:bg-secondary truncate">
                        Healthy breakfast ideas
                    </button>
                </div>
            </ScrollArea>
            <div className="border-t p-2">
                <div className="flex items-center gap-2 p-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {user?.displayName ? user.displayName.charAt(0) : <Bot />}
                    </div>
                    <span className="font-semibold truncate">{user?.displayName || 'AI Assistant'}</span>
                </div>
            </div>
        </aside>
    )
}


const ChatMessageDisplay = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    const { user } = useAuth();
  
    return (
      <div className={cn('flex items-start gap-4 py-6')}>
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          {isUser ? (user?.displayName ? user.displayName.charAt(0) : 'U') : <Bot />}
        </div>
        <div className="flex-1 space-y-4">
            <p className="font-semibold">{isUser ? (user?.displayName || "You") : "AI Assistant"}</p>
            <div className="prose prose-sm max-w-none text-foreground">
                <p>{message.content}</p>
            </div>
            {message.products && message.products.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {message.products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
        </div>
      </div>
    );
  };
  
  const EmptyChat = ({ setInputValue }: { setInputValue: (value: string) => void }) => {
    const suggestions = [
        "What are some healthy snacks?",
        "Find deals on fresh vegetables",
        "What's a good coffee brand?",
        "Plan a weekly grocery list"
    ];

    return (
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="text-center">
            <Bot className="mx-auto h-12 w-12 mb-4" />
            <h2 className="text-2xl font-semibold">How can I help you today?</h2>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-3xl">
            {suggestions.map((s, i) => (
                <button 
                    key={i} 
                    onClick={() => setInputValue(s)}
                    className="p-4 border rounded-lg text-left hover:bg-secondary transition-colors"
                >
                    <p className="font-semibold">{s}</p>
                    <p className="text-sm text-muted-foreground">Get a response from the AI</p>
                </button>
            ))}
        </div>
      </div>
    );
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
      <Sidebar />
      <main className="flex flex-1 flex-col pb-16 md:pb-0">
        <header className="flex md:hidden items-center justify-between border-b p-2">
            <h1 className="text-lg font-semibold">AI Assistant</h1>
            <Button variant="ghost" size="icon">
                <Plus />
            </Button>
        </header>

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
        
        <div className="w-full max-w-4xl mx-auto p-4 bg-background md:bg-transparent fixed bottom-16 md:bottom-0 md:relative">
          <form onSubmit={handleSubmit} className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about products, deals, or get recipe ideas..."
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
              <ArrowUp className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground mt-2">
            AI responses may not always be accurate. Check product details for final information.
          </p>
        </div>
      </main>
    </div>
  );
}
