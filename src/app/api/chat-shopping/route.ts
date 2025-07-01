
import { chatShopping } from '@/ai/flows/chat-shopping';
import type { ChatShoppingInput } from '@/ai/flows/chat-shopping';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensures the route is always dynamic

export async function POST(req: Request) {
  try {
    // The request body now only includes query and history
    const body: ChatShoppingInput = await req.json();
    if (!body.query) {
       return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // The chatShopping flow will handle the logic and return the new state
    const result = await chatShopping(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
