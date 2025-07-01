'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider, appleProvider } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
  RecaptchaVerifier,
  type ConfirmationResult,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { GoogleIcon } from './google-icon';
import { AppleIcon } from './apple-icon';

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        size: 'invisible',
        callback: () => { console.log('reCAPTCHA verified'); },
      });
    }
  }, []);

  const handleSocialLogin = async (provider: typeof googleProvider | typeof appleProvider) => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Success!', description: 'You have been successfully signed in.' });
      router.push('/');
    } catch (error: any) {
      console.error('Social sign-in error:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Success!', description: 'You have been successfully signed in.' });
      router.push('/');
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !recaptchaVerifierRef.current) return;
    setLoading(true);

    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    try {
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast({ title: 'OTP Sent', description: `An OTP has been sent to ${formattedPhone}.` });
    } catch (error: any) {
      console.error('Phone sign-in error:', error);
      toast({ variant: 'destructive', title: 'Error sending OTP', description: error.message });
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
      toast({ title: 'Success!', description: 'You have been successfully signed in.' });
      router.push('/');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({ variant: 'destructive', title: 'Invalid OTP', description: 'The OTP you entered is incorrect.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="phone">Phone</TabsTrigger>
        </TabsList>
        <TabsContent value="email">
          <form onSubmit={handleEmailLogin} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email Address</Label>
              <Input id="login-email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input id="login-password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login with Email
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="phone">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-phone">Phone Number</Label>
                <Input id="login-phone" type="tel" placeholder="e.g. 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={loading} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-otp">Enter OTP</Label>
                <Input id="login-otp" type="text" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required disabled={loading} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify OTP & Login
              </Button>
            </form>
          )}
        </TabsContent>
      </Tabs>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => handleSocialLogin(googleProvider)} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
          Google
        </Button>
        <Button variant="outline" onClick={() => handleSocialLogin(appleProvider)} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AppleIcon className="mr-2 h-4 w-4" />}
          Apple
        </Button>
      </div>
      <div ref={recaptchaContainerRef}></div>
    </>
  );
}
