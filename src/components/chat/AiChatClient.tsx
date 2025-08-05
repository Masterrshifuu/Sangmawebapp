
'use client';

import { useChatHandler } from '@/hooks/use-chat-handler';
import { Button } from '@/components/ui/button';
import { Home, Image as ImageIcon, Send, X, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import Link from 'next/link';
import { EmptyChat } from './EmptyChat';
import { ChatMessageDisplay } from './ChatMessageDisplay';

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
    handleSubmit,
    setInputValue,
  } = useChatHandler();

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

      <ScrollArea className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-8">
            {messages.length === 0 ? (
                <EmptyChat setInputValue={setInputValue} />
            ) : (
                messages.map((message) => (
                    <ChatMessageDisplay key={message.id} message={message} />
                ))
            )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl space-y-2">
          {imagePreview && (
            <div className="relative w-24 h-24 rounded-md border overflow-hidden">
              <Image src={imagePreview} alt="Image preview" fill className="object-cover" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
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
              placeholder="Ask about products, recipes, or anything else..."
              className="pr-24 min-h-12 max-h-40 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={1}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon />
                <span className="sr-only">Upload Image</span>
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              <Button type="submit" size="icon" disabled={isLoading || (!inputValue.trim() && !imagePreview)}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
