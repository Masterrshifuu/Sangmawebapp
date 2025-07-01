'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/login-form';
import { SignUpForm } from '@/components/auth/signup-form';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';


export default function AuthPage() {
  const router = useRouter();
  const [authCheckLoading, setAuthCheckLoading] = useState(true);

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

  if (authCheckLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
      <Tabs defaultValue="login" className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="login">
              <CardTitle className="mb-4 text-center text-2xl">
                Welcome Back
              </CardTitle>
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <CardTitle className="mb-4 text-center text-2xl">
                Create an Account
              </CardTitle>
              <SignUpForm />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
