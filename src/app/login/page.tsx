
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
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
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.31v2.84C4.25 20.98 7.89 23 12 23z" fill="#34A853"></path>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.31c-.66 1.32-1.02 2.79-1.02 4.43s.36 3.11 1.02 4.43l3.53-2.84z" fill="#FBBC05"></path>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.89 1 4.25 3.02 2.31 6.1l3.53 2.84c.87-2.6 3.3-4.56 6.16-4.56z" fill="#EA4335"></path>
    </svg>
);

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginForm = ({ onGoogleSignIn }: { onGoogleSignIn: () => void }) => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            router.push('/');
        } catch (error: any) {
            console.error('Login error:', error);
            // Optionally, handle specific errors here, e.g., display a message
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="space-y-4 text-left">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input placeholder="you@example.com" type="email" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl><Input placeholder="••••••••" type="password" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

const SignUpForm = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { name: '', email: '', password: '' },
    });

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            await updateProfile(userCredential.user, { displayName: data.name });
            router.push('/signup/phone');
        } catch (error: any) {
            console.error('Sign up error:', error);
            // Optionally, handle specific errors here, e.g., display a message
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="you@example.com" type="email" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input placeholder="••••••••" type="password" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                </Button>
            </form>
        </Form>
    );
};


export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/');
    }
  }, [user, authLoading, router]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        router.push('/');
    } catch (error) {
        console.error('Google Sign In Error', error);
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
        
        <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="pt-6">
                <LoginForm onGoogleSignIn={handleGoogleSignIn} />
            </TabsContent>
            <TabsContent value="signup" className="pt-6">
                <SignUpForm />
            </TabsContent>
        </Tabs>

        <div className="my-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
        </div>
        
        <Button variant="outline" className="w-full" size="lg" onClick={handleGoogleSignIn}>
            <GoogleIcon />
            Google
        </Button>

        <Button variant="link" asChild className="mt-4 text-muted-foreground">
            <Link href="/">Skip for now</Link>
        </Button>
      </div>
    </main>
  );
}
