
'use client';

import { Bot } from "lucide-react";

const suggestions = [
    "What are some healthy snacks?",
    "Find deals on fresh vegetables",
    "What's a good coffee brand?",
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
    return (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
            <div>
                <Bot className="mx-auto h-12 w-12 mb-4" />
                <h2 className="text-2xl font-semibold">How can I help you today?</h2>
            </div>
            <div className="mt-12 space-y-4 w-full max-w-2xl">
                {suggestions.map((s, i) => (
                    <PromptSuggestion key={i} text={s} onClick={setInputValue} />
                ))}
            </div>
        </div>
    );
};
