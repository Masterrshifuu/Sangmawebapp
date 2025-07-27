
'use client';

import type { AIState } from '@/lib/types';
import { Bot } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import Image from 'next/image';

type ChatMessage = AIState[number] & {
    productContext?: { name: string; description: string };
};

export const ChatMessageDisplay = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    const { user } = useAuth();
  
    return (
      <div className={cn('flex items-start gap-4 py-6')}>
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          {isUser ? (user?.displayName ? user.displayName.charAt(0) : 'U') : <Bot />}
        </div>
        <div className="flex-1 space-y-4">
            <p className="font-semibold">{isUser ? (user?.displayName || "You") : "AI Assistant"}</p>
            <div className="prose prose-sm max-w-none text-foreground space-y-2">
                <p>{message.content}</p>
                {message.attachments && (
                  <div className="not-prose flex gap-2">
                    {message.attachments.map((att, index) => (
                        <div key={index} className="relative w-32 h-32 border rounded-lg overflow-hidden">
                            <Image src={att.url} alt="attachment" layout="fill" objectFit="cover" />
                        </div>
                    ))}
                  </div>
                )}
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
