
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
    auth, 
    googleProvider, 
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    type ConfirmationResult
} from '@/lib/firebase';
import { PhoneStep } from '@/components/auth/phone-step';
import { OtpStep } from '@/components/auth/otp-step';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import Logo from '@/components/logo';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authCheckLoading, setAuthCheckLoading] = useState(true);

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/');
      } else {
        setAuthCheckLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response: any) => {},
        });
    }
  }, []);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        variant: "destructive",
        title: "Google Login Failed",
        description: error.message,
      });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleAppleLogin = () => {
    toast({
      title: "Coming Soon",
      description: "Apple Sign-In is not yet available.",
    });
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !recaptchaVerifierRef.current) return;

    setIsSubmitting(true);
    try {
      const fullPhoneNumber = `+91${phone}`;
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifierRef.current);
      confirmationResultRef.current = confirmationResult;
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to ${fullPhoneNumber}.`,
      });
    } catch (error: any) {
      console.error("Phone sign-in error:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send OTP",
        description: error.message,
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResultRef.current) return;
    
    setIsSubmitting(true);
    try {
      await confirmationResultRef.current.confirm(otp);
      router.push('/');
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "The verification code is incorrect. Please try again.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSkipLogin = () => {
    sessionStorage.setItem('skippedLogin', 'true');
    router.push('/');
  };

  if (authCheckLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Logo className="animate-logo-pulse" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
       <div id="recaptcha-container"></div>
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center relative">
          {step === 'otp' && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-2"
              onClick={() => setStep('phone')}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <CardTitle className="text-2xl font-headline pt-2">
            {step === 'phone' ? 'Log In or Sign Up' : 'Enter OTP'}
          </CardTitle>
          <CardDescription>
            {step === 'phone'
              ? 'Use your phone number or another service to continue.'
              : `We've sent a code to +91${phone}.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {step === 'phone' ? (
            <PhoneStep 
                phone={phone}
                setPhone={setPhone}
                isSubmitting={isSubmitting}
                handleGoogleLogin={handleGoogleLogin}
                handleAppleLogin={handleAppleLogin}
                handlePhoneSubmit={handlePhoneSubmit}
                onSkip={handleSkipLogin}
            />
          ) : (
            <OtpStep 
                otp={otp}
                setOtp={setOtp}
                isSubmitting={isSubmitting}
                handleOtpSubmit={handleOtpSubmit}
                setStep={setStep}
            />
          )}
        </CardContent>
        {step === 'phone' && (
          <CardFooter>
            <p className="px-4 pt-2 text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
