
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useLocation } from '@/hooks/use-location';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Plus } from 'lucide-react';

export const ChatSidebar = () => {
    const { user } = useAuth();
    const { address } = useLocation();

    return (
        <div className="flex flex-col h-full bg-secondary/30">
            <div className="p-4 border-b mt-8">
                 <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2" /> New Chat
                </Button>
            </div>
            <ScrollArea className="flex-1 my-2">
                <div className="px-2 space-y-1">
                    {/* Placeholder for previous chats */}
                    <p className="px-2 py-1 text-xs text-muted-foreground font-semibold">Today</p>
                    <button className="w-full text-left text-sm p-2 rounded-md hover:bg-secondary truncate">
                        Recommendations for {address?.area || 'your area'}
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
        </div>
    )
}
