
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface OtpStepProps {
    otp: string;
    setOtp: (otp: string) => void;
    isSubmitting: boolean;
    handleOtpSubmit: (e: React.FormEvent) => void;
    setStep: (step: 'phone' | 'otp') => void;
}

export function OtpStep({
    otp,
    setOtp,
    isSubmitting,
    handleOtpSubmit,
    setStep
}: OtpStepProps) {
    return (
        <form onSubmit={handleOtpSubmit} className="grid gap-4">
            <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={isSubmitting}
                maxLength={6}
            />
            <Button type="submit" disabled={isSubmitting || otp.length < 6} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP
            </Button>
            <Button 
                variant="link" 
                size="sm" 
                onClick={() => setStep('phone')}
                disabled={isSubmitting}
                type="button"
            >
                Entered the wrong number?
            </Button>
        </form>
    );
}
