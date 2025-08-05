
'use client';

import { useState, useRef } from 'react';
import type { AIState } from '@/lib/types';
import { continueConversation } from '@/app/actions';

export function useChatHandler() {
    const [messages, setMessages] = useState<AIState>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (value: string) => {
        setInputValue(value);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() && !imagePreview) return;

        setIsLoading(true);

        const newUserMessage: AIState[number] = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
        };

        if (imagePreview) {
            newUserMessage.attachments = [{ contentType: 'image', url: imagePreview }];
        }
        
        const newHistory: AIState = [...messages, newUserMessage];
        setMessages(newHistory);
        setInputValue('');
        clearImage();

        const response = await continueConversation(newHistory);
        
        setMessages(response);
        setIsLoading(false);
    };

    return {
        messages,
        inputValue,
        isLoading,
        imagePreview,
        fileInputRef,
        setInputValue,
        handleInputChange,
        handleImageChange,
        clearImage,
        handleSubmit,
    };
}
