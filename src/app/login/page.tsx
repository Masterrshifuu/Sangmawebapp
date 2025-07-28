
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import Logo from '@/components/logo';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(phoneRegex, 'Invalid phone number'),
});

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits'),
});

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          },
        }
      );
    }
    return window.recaptchaVerifier;
  };

  const onSendOtp = async (data: z.infer<typeof phoneSchema>) => {
    setLoading(true);
    try {
      const recaptchaVerifier = setupRecaptcha();
      // Ensure the phone number starts with +91 for India
      const formattedPhone = data.phone.startsWith('+')
        ? data.phone
        : `+91${data.phone}`;
      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifier
      );
      setConfirmationResult(result);
      setShowOtpInput(true);
      toast({
        title: 'OTP Sent',
        description: `An OTP has been sent to ${formattedPhone}`,
      });
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to send OTP',
        description:
          error.message || 'Please check the phone number and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (data: z.infer<typeof otpSchema>) => {
    if (!confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(data.otp);
      // The onAuthStateChanged listener in useAuth will handle the redirect
      toast({ title: 'Success!', description: 'You are now logged in.' });
      otpForm.reset();
      phoneForm.reset();
    } catch (error: any) {
      console.error('OTP Verification error:', error);
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'The OTP you entered is incorrect. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse">
          <Logo />
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-8">
      <div className="max-w-md w-full text-center">
        <Logo className="justify-center mb-8" />
        <h1 className="text-2xl font-bold font-headline mb-2">
          {showOtpInput ? 'Enter OTP' : 'Welcome!'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {showOtpInput
            ? 'Enter the 6-digit code sent to your phone.'
            : 'Sign in or create an account with your phone number.'}
        </p>

        {!showOtpInput ? (
          <Form {...phoneForm}>
            <form
              onSubmit={phoneForm.handleSubmit(onSendOtp)}
              className="space-y-4 text-left"
            >
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="9876543210"
                        type="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(onVerifyOtp)}
              className="space-y-4 text-left"
            >
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OTP Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456"
                        type="number"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Verify OTP'}
              </Button>
               <Button variant="link" size="sm" onClick={() => setShowOtpInput(false)} className="w-full">
                    Change Phone Number
                </Button>
            </form>
          </Form>
        )}

        <div id="recaptcha-container" className="mt-4"></div>
      </div>
    </main>
  );
}
