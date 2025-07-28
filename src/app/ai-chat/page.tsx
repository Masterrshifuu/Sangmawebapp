
import type { Metadata } from 'next';
import { AiChatClient } from '@/components/chat/AiChatClient';

export const metadata: Metadata = {
    title: 'Sangma AI Assistant',
    description: 'Ask our AI anything about our products, get recommendations, and receive help with your shopping. Your personal grocery expert.',
}

export default function AiChatPage() {
  return <AiChatClient />;
}
