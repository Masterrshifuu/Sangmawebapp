
'use client';

import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  User,
  LogOut,
  FileText,
  Shield,
  MapPin,
  Package,
  Headphones,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';

const AccountSkeleton = () => (
    <>
        <Header />
        <main className="flex-1 pb-16 md:pb-0">
             <div className="p-6 bg-accent/20">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32 rounded" />
                        <Skeleton className="h-4 w-48 rounded" />
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-24 rounded" />
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full rounded-lg" />
                            <Skeleton className="h-12 w-full rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    </>
);


const AccountListItem = ({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
}) => {
  const content = (
    <div
      className="flex items-center p-4 bg-card rounded-lg transition-all duration-200 active:bg-accent/20"
      onClick={onClick}
    >
      <Icon className="w-6 h-6 mr-4 text-accent" />
      <span className="flex-1 font-medium text-foreground">{label}</span>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return <button className="w-full text-left">{content}</button>;
};

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
    return <AccountSkeleton />;
  }

  if (!user) {
    // Optionally, redirect to a login page if you have one
    router.push('/');
    return <AccountSkeleton />;
  }
  
  const generalItems = [
    { icon: Package, label: 'My Orders', href: '/my-orders' },
    { icon: MapPin, label: 'Address Book', href: '#' },
  ];
  
  const securityItems = [
    { icon: User, label: 'Profile Details', href: '#' },
    { icon: Shield, label: 'Change Password', href: '#' },
  ];

  const legalItems = [
    { icon: FileText, label: 'Terms & Conditions', href: '/terms' },
    { icon: RefreshCw, label: 'Refund & Cancellation Policy', href: '/refund-policy' },
    { icon: Headphones, label: 'Help Center', href: '#' },
  ];

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
            <section>
                <h2 className="text-sm font-semibold text-muted-foreground px-2 mb-2">GENERAL</h2>
                <div className="space-y-2">
                    {generalItems.map(item => <AccountListItem key={item.label} {...item} />)}
                </div>
            </section>
            
            <section>
                <h2 className="text-sm font-semibold text-muted-foreground px-2 mb-2">ACCOUNT & SECURITY</h2>
                 <div className="space-y-2">
                    {securityItems.map(item => <AccountListItem key={item.label} {...item} />)}
                </div>
            </section>

            <section>
                <h2 className="text-sm font-semibold text-muted-foreground px-2 mb-2">LEGAL & HELP</h2>
                 <div className="space-y-2">
                    {legalItems.map(item => <AccountListItem key={item.label} {...item} />)}
                </div>
            </section>
        
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
