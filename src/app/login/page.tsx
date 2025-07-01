
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  type ConfirmationResult,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';

// Note: Metadata export is for static analysis and won't work in a client component.
// We keep it here for reference, but actual metadata should be handled in a parent layout or page if needed.
export const metadata: Metadata = {
    title: 'Login or Sign Up - Sangma Megha Mart',
    description: 'Access your account or create a new one.',
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // This effect initializes the RecaptchaVerifier for phone authentication.
    // It runs only once on the client-side after the component mounts.
    if (recaptchaContainerRef.current) {
        // We use a ref to ensure the verifier is created only once.
        if (!recaptchaVerifierRef.current) {
             recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                size: 'invisible',
                callback: (response: any) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                    console.log('reCAPTCHA verified');
                },
             });
        }
    }
  }, []);

  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    
    const actionCodeSettings = {
      url: `${window.location.origin}`, // URL to redirect back to
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      toast({
        title: 'Check your email',
        description: `A sign-in link has been sent to ${email}.`,
      });
      setEmail('');
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !recaptchaVerifierRef.current) return;
    setLoading(true);
    
    // Format phone number to E.164 format
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    try {
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: `An OTP has been sent to ${formattedPhone}.`,
      });
    } catch (error: any) {
      console.error('Phone sign-in error:', error);
      toast({
        variant: 'destructive',
        title: 'Error sending OTP',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;
    setLoading(true);

    try {
      await confirmationResult.confirm(otp);
      toast({
        title: 'Success!',
        description: 'You have been successfully signed in.',
      });
      router.push('/profile');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        variant: 'destructive',
        title: 'Invalid OTP',
        description: 'The OTP you entered is incorrect. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login or Sign Up</CardTitle>
          <CardDescription>
            Enter your email or phone number to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="phone" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone">Phone</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            <TabsContent value="phone">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send OTP
                  </Button>
                </form>
              ) : (
                 <form onSubmit={handleVerifyOtp} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="\d{6}"
                      maxLength={6}
                      placeholder="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify OTP & Sign In
                  </Button>
                </form>
              )}
            </TabsContent>
            <TabsContent value="email">
              <form onSubmit={handleSendEmailLink} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Sign-in Link
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* This div is required for Firebase's invisible reCAPTCHA */}
      <div ref={recaptchaContainerRef}></div>
    </div>
  );
}
