
'use client';

import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogIn, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import { AccountPageSkeleton } from '@/components/pages/account/AccountPageSkeleton';
import { AccountSection } from '@/components/pages/account/AccountSection';
import { getLegalItems, getGeneralItems, getSecurityItems } from '@/components/pages/account/accountNavItems';


export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (loading) {
    return <AccountPageSkeleton />;
  }
  
  const legalItems = getLegalItems();
  
  if (!user) {
    // Logged-out view
    return (
        <>
            <Header />
            <main className="flex-1 pb-24 md:pb-0 bg-background">
                <div className="p-6 text-center" style={{ backgroundColor: '#faf368' }}>
                     <h1 className="text-xl font-bold font-headline text-black">
                        Welcome to Sangma Megha Mart
                    </h1>
                    <p className="text-sm text-gray-800 mt-1">Log in to manage your orders and account details.</p>
                     <Button className="mt-4" onClick={() => router.push('/?auth=true')}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Login / Sign Up
                    </Button>
                </div>

                <div className="p-4 space-y-6">
                    <AccountSection title="LEGAL & HELP" items={legalItems} />
                </div>
            </main>
        </>
    )
  }
  
  // Logged-in view
  const generalItems = getGeneralItems();
  const securityItems = getSecurityItems();

  return (
    <>
      <Header />
      <main className="flex-1 pb-24 md:pb-0 bg-background">
        <div className="p-6" style={{ backgroundColor: '#faf368' }}>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary">
                <Image
                    src={user.photoURL || `https://placehold.co/80x80.png`}
                    alt={user.displayName || 'User'}
                    width={80}
                    height={80}
                    className="object-cover"
                    data-ai-hint="user avatar"
                />
            </div>
            <div>
              <h1 className="text-xl font-bold font-headline text-black">
                {user.displayName || 'Valued Customer'}
              </h1>
              <p className="text-sm text-gray-800">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
            <AccountSection title="GENERAL" items={generalItems} />
            <AccountSection title="ACCOUNT & SECURITY" items={securityItems} />
            <AccountSection title="LEGAL & HELP" items={legalItems} />
        
            <div className="pt-4">
                <Button variant="outline" className="w-full text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
                    <LogOut className="w-5 h-5 mr-2" />
                    Log Out
                </Button>
            </div>
        </div>
      </main>
    </>
  );
}
