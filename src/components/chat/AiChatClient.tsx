
'use client';

import { useRef, useEffect } from 'react';
import { useChatHandler } from '@/hooks/use-chat-handler';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp, Bot, ImagePlus, X, Home, ShoppingCart, PanelLeft } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

import { ChatMessageDisplay } from '@/components/chat/ChatMessageDisplay';
import { EmptyChat } from '@/components/chat/EmptyChat';
import Image from 'next/image';
import { CartSheet } from '@/components/sheets/CartSheet';
import Link from 'next/link';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { ChatSidebar } from '@/components/chat/ChatSidebar';

export function AiChatClient() {
  const {
    messages,
    inputValue,
    isLoading,
    imagePreview,
    fileInputRef,
    handleInputChange,
    handleImageChange,
    clearImage,
    handleSubmit
  } = useChatHandler();

  const { totalItems } = useCart();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="relative flex flex-col h-screen bg-background">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-2 md:p-4 h-[65px]">
            <div className="flex items-center gap-2">
                <Drawer direction="left">
                    <DrawerTrigger asChild>
                         <Button variant="ghost" size="icon">
                            <PanelLeft />
                            <span className="sr-only">Open Menu</span>
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="h-full w-64 p-0">
                        <DrawerHeader>
                            <DrawerTitle className="sr-only">Chat Menu</DrawerTitle>
                        </DrawerHeader>
                        <ChatSidebar />
                    </DrawerContent>
                </Drawer>
                <CartSheet>
                  <Button variant="ghost" size="icon" className="relative">
                      <ShoppingCart />
                      <span className="sr-only">Open Cart</span>
                      {totalItems > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                            {totalItems}
                        </span>
                      )}
                  </Button>
                </CartSheet>
            </div>
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

        <ScrollArea className="flex-1">
            <div className="max-w-4xl mx-auto px-4 pb-32">
                {messages.length === 0 && !isLoading ? (
                    <div className="min-h-[calc(100vh-210px)] flex items-center">
                         <EmptyChat setInputValue={handleInputChange} />
                    </div>
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
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>
        
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto p-4">
                <form onSubmit={handleSubmit} className="relative">
                    {imagePreview && (
                      <div className="relative mb-2 w-24 h-24 p-1 border rounded-lg">
                        <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="cover" className="rounded-md" />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-background hover:bg-muted"
                          onClick={clearImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="relative flex items-center">
                        <Textarea
                          value={inputValue}
                          onChange={(e) => handleInputChange(e.target.value)}
                          placeholder="Ask about products.."
                          className="pr-20 py-3 h-12 min-h-12 resize-none focus-visible:ring-1 focus-visible:ring-accent"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit();
                            }
                          }}
                          rows={1}
                        />
                        <div className="absolute right-2 flex items-center gap-1">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="sr-only"
                            />
                            <Button 
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImagePlus className="h-5 w-5" />
                                <span className="sr-only">Upload Image</span>
                            </Button>
                            <Button 
                                type="submit" 
                                size="icon"
                                disabled={(!inputValue.trim() && !imagePreview) || isLoading}
                                className="h-8 w-8 bg-accent hover:bg-accent/80 disabled:bg-muted"
                            >
                              <ArrowUp className="h-5 w-5 text-black" />
                              <span className="sr-only">Send</span>
                            </Button>
                        </div>
                    </div>
                </form>
                <p className="text-xs text-center text-muted-foreground mt-2 transform scale-90 origin-center">
                    AI responses may not always be accurate. Check product details for final information.
                </p>
            </div>
        </div>
    </div>
  );
}
