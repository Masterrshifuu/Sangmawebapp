
'use client';

import { useState } from 'react';
import { Bot, ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from '@/components/ui/button';

const suggestions = [
    "What are some healthy snacks?",
    "Find deals on fresh vegetables",
    "What's a good coffee brand?",
    "Plan a weekly grocery list"
];

const PromptSuggestion = ({ text, onClick }: { text: string, onClick: (text: string) => void }) => (
    <button
        onClick={() => onClick(text)}
        className="p-4 border rounded-lg text-left hover:bg-secondary transition-colors w-full"
    >
        <p className="font-semibold">{text}</p>
        <p className="text-sm text-muted-foreground">Get a response from the AI</p>
    </button>
);

export const EmptyChat = ({ setInputValue }: { setInputValue: (value: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const primarySuggestion = suggestions[0];
    const otherSuggestions = suggestions.slice(1);

    return (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
            <div>
                <Bot className="mx-auto h-12 w-12 mb-4" />
                <h2 className="text-2xl font-semibold">How can I help you today?</h2>
            </div>
            <div className="mt-12 space-y-4 w-full max-w-2xl">
                <PromptSuggestion text={primarySuggestion} onClick={setInputValue} />

                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <CollapsibleContent className="space-y-4">
                       {otherSuggestions.map((s, i) => (
                           <PromptSuggestion key={i} text={s} onClick={setInputValue} />
                       ))}
                    </CollapsibleContent>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="mt-2">
                            {isOpen ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                            {isOpen ? 'Less suggestions' : 'More suggestions'}
                        </Button>
                    </CollapsibleTrigger>
                </Collapsible>
            </div>
        </div>
    );
};
