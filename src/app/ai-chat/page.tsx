
'use client';

import { useState, useRef, useEffect } from 'react';
import type { AIState } from '@/lib/types';
import { getChatResponse, getChatResponseWithImage } from '@/app/actions';

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
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { ChatSidebar } from '@/components/chat/ChatSidebar';

type ChatMessage = AIState[number] & {
    productContext?: { name: string; description: string };
};

export default function AiChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputValue.trim() && !imageFile) || isLoading) return;

    setIsLoading(true);

    let userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputValue || "Here's an image.", // Provide default text if only image is present
    };
    
    // Add image to user message if present
    if (imagePreview) {
        userMessage.attachments = [{ contentType: 'image', url: imagePreview }];
    }
    
    const newMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(newMessages);

    // Clear inputs after submitting
    setInputValue('');
    clearImage();

    try {
        let responseMessage;
        if (imageFile) {
            const imageDataUri = await fileToDataUri(imageFile);
            responseMessage = await getChatResponseWithImage(newMessages, imageDataUri);
        } else {
            responseMessage = await getChatResponse(newMessages);
        }
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
            <div className="font-semibold font-headline text-lg">Sangma</div>
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
                         <EmptyChat setInputValue={setInputValue} />
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
                          onChange={(e) => setInputValue(e.target.value)}
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
                                disabled={(!inputValue.trim() && !imageFile) || isLoading}
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
