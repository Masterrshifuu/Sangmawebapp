
'use client';

import { useState, useRef } from 'react';
import { getChatResponse, getChatResponseWithImage } from '@/app/actions';
import type { AIState } from '@/lib/types';

type ChatMessage = AIState[number] & {
    productContext?: { name: string; description: string };
};

export function useChatHandler() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (value: string) => {
        setInputValue(value);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const fileToDataUri = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!inputValue.trim() && !imageFile) || isLoading) return;

        setIsLoading(true);

        let userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue || "Here's an image.",
        };
        
        if (imagePreview) {
            userMessage.attachments = [{ contentType: 'image', url: imagePreview }];
        }
        
        const newMessages: ChatMessage[] = [...messages, userMessage];
        setMessages(newMessages);

        setInputValue('');
        clearImage();

        try {
            let responseMessage;
            if (imageFile) {
                const imageDataUri = await fileToDataUri(imageFile);
                responseMessage = await getChatResponseWithImage(newMessages, imageDataUri);
            } else {
                responseMessage = await getChatResponse(newMessages);
            }
            setMessages(currentMessages => [...currentMessages, responseMessage]);
        } catch (error) {
            console.error("Failed to get chat response:", error);
            const errorMessage: ChatMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            };
            setMessages(currentMessages => [...currentMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        inputValue,
        isLoading,
        imagePreview,
        fileInputRef,
        handleInputChange,
        handleImageChange,
        clearImage,
        handleSubmit,
    };
}
