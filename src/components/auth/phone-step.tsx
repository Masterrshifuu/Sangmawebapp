
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { GoogleIcon } from './google-icon';
import { AppleIcon } from './apple-icon';

interface PhoneStepProps {
    phone: string;
    setPhone: (phone: string) => void;
    isSubmitting: boolean;
    handleGoogleLogin: () => void;
    handleAppleLogin: () => void;
    handlePhoneSubmit: (e: React.FormEvent) => void;
    onSkip: () => void;
}

export function PhoneStep({
    phone,
    setPhone,
    isSubmitting,
    handleGoogleLogin,
    handleAppleLogin,
    handlePhoneSubmit,
    onSkip
}: PhoneStepProps) {
    return (
        <div className="grid gap-4">
            <form onSubmit={handlePhoneSubmit} className="grid gap-2">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        disabled={isSubmitting}
                        pattern="\d{10}"
                        title="Please enter a 10-digit phone number"
                    />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleGoogleLogin} disabled={isSubmitting}>
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    Google
                </Button>
                <Button variant="outline" onClick={handleAppleLogin} disabled={isSubmitting}>
                    <AppleIcon className="mr-2 h-4 w-4" />
                    Apple
                </Button>
            </div>
            
            <div className="border-t pt-4 mt-4">
                <Button variant="link" className="w-full text-muted-foreground" onClick={onSkip}>
                    Skip for now
                </Button>
            </div>
        </div>
    );
}
