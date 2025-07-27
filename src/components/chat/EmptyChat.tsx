
'use client';

import * as React from 'react';
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
  } from "@/components/ui/carousel"
import { AnimatedBotIcon } from './AnimatedBotIcon';

const suggestions = [
    "What are some healthy snacks?",
    "Find deals on fresh vegetables",
    "What's a good coffee brand?",
    "Suggest a recipe for dinner tonight",
];

const PromptSuggestion = ({ text, onClick }: { text: string, onClick: (text: string) => void }) => (
    <button
        onClick={() => onClick(text)}
        className="p-4 border border-accent/50 bg-background shadow-sm rounded-lg text-left hover:bg-secondary transition-colors w-full h-full"
    >
        <p className="font-semibold">{text}</p>
        <p className="text-sm text-muted-foreground">Get a response from the AI</p>
    </button>
);

export const EmptyChat = ({ setInputValue }: { setInputValue: (value: string) => void }) => {
    const plugin = React.useRef(
        Autoplay({ delay: 1500, stopOnInteraction: true })
    )

    return (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
            <div className="w-full max-w-2xl flex flex-col items-center">
                <AnimatedBotIcon className="mb-4" />
                <h2 className="text-2xl font-semibold">How can I help you today?</h2>
            </div>
            <div className="mt-12 w-full max-w-md">
                <Carousel
                    plugins={[plugin.current]}
                    className="w-full"
                    opts={{
                        align: "start",
                        loop: true,
                      }}
                    orientation="vertical"
                    onMouseEnter={plugin.current.stop}
                    onMouseLeave={plugin.current.reset}
                >
                    <CarouselContent className="-mt-4 h-[100px]">
                        {suggestions.map((s, i) => (
                             <CarouselItem key={i} className="pt-4 basis-auto">
                                <PromptSuggestion text={s} onClick={setInputValue} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </div>
    );
};
