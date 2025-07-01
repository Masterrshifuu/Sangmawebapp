
import { chatShopping } from '@/ai/flows/chat-shopping';
import type { ChatShoppingInput } from '@/ai/flows/chat-shopping';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensures the route is always dynamic

export async function POST(req: Request) {
  try {
    const body: ChatShoppingInput = await req.json();
    if (!body.query) {
       return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    const result = await chatShopping(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
