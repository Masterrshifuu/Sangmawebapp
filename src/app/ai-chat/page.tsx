
import type { Metadata } from 'next';
import { AiChatClient } from '@/components/chat/AiChatClient';

export const metadata: Metadata = {
    title: 'Sangma AI Assistant | Your Personal Grocery Expert',
    description: 'Ask Sangma AI anything about our products, get recommendations, find deals, and receive help with your shopping. Your personal grocery expert at Sangma Megha Mart in Tura.',
    keywords: ['Sangma Ai', 'AI Shopping Assistant', 'Tura Grocery Help', 'Sangma Megha Mart AI'],
}

export default function AiChatPage() {
  return <AiChatClient />;
}
