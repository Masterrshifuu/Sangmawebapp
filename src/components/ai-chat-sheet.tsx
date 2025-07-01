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
import { Bot, Send, Loader2, User, ShoppingCart } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';
import type { Product, Message, CartItem } from '@/lib/types';
import ProductCard from './product-card';
import { useCart } from '@/context/cart-context';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function AiChatSheet({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { cartItems, syncAIAssistantCart, cartCount } = useCart();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = messages.map(({ role, content }) => ({ role, content }));
      
      const productsForApi = cartItems.flatMap(item => {
        const productInfo: Product = {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          category: item.category,
          bestseller: item.bestseller,
        };
        return Array(item.quantity).fill(productInfo);
      });
      
      const res = await fetch('/api/chat-shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, history: historyForApi, cart: productsForApi }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: `API request failed with status ${res.status}` }));
        throw new Error(errorData.details || 'ChatShopping API failed');
      }

      const result = await res.json();
      
      const aiMessage: Message = { 
        role: 'assistant', 
        content: result.response, 
        products: result.recommendedProducts || [],
        cart: result.updatedCart || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      if (result.updatedCart) {
        syncAIAssistantCart(result.updatedCart);
      }

    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof Error ? error.message : "Sorry, I'm having trouble connecting. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderCart = (cartItems: Product[]) => (
    <div className="mt-4">
      <h4 className="font-bold mb-2">Your Cart ({cartItems.length})</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cartItems.map((product) => (
          <ProductCard key={product.id} product={product} size="small" />
        ))}
      </div>
    </div>
  );

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
        <Collapsible open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetHeader className="px-4 pb-4 border-b flex items-center justify-start gap-4">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <ShoppingCart className="h-5 w-5"/>
                        {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">{cartCount}</span>}
                        <span className="sr-only">Toggle Cart View</span>
                    </Button>
                </CollapsibleTrigger>
            </SheetHeader>
            <CollapsibleContent className="border-b">
              <div className="p-4">
                <h4 className="font-bold mb-4 text-center">Your Current Cart ({cartCount})</h4>
                {cartCount > 0 ? (
                  <ScrollArea className="max-h-[20vh]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {cartItems.map((item) => (
                        <ProductCard key={item.id} product={item} size="small" />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-4">Add items using chat!</p>
                )}
              </div>
            </CollapsibleContent>
        </Collapsible>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {message.products.map((product) => (
                            <ProductCard key={product.id} product={product} size="small" />
                          ))}
                        </div>
                      </div>
                    )}
                    {message.content.toLowerCase().includes('your cart') && message.cart && message.cart.length > 0 && renderCart(message.cart)}
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
            ))}
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
                  <p className="text-sm">Ask me to find products, add to cart, or even checkout!</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background flex items-center gap-2">
            <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 'add shampoo to cart'"
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
