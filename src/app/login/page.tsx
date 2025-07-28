
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginForm = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            toast({ title: 'Success!', description: 'You are now logged in.' });
            router.push('/');
        } catch (error: any) {
            console.error('Login error:', error);
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Invalid email or password. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-left">
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
    );
};

const SignUpForm = () => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
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
            
            toast({ title: 'Account Created!', description: 'Welcome! You are now logged in.' });
            router.push('/');
        } catch (error: any) {
            console.error('Sign up error:', error);
            const description = error.code === 'auth/email-already-in-use'
                ? 'This email is already registered. Please sign in.'
                : 'An error occurred. Please try again.';
            toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description,
            });
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
                <LoginForm />
            </TabsContent>
            <TabsContent value="signup" className="pt-6">
                <SignUpForm />
            </TabsContent>
        </Tabs>

      </div>
    </main>
  );
}
