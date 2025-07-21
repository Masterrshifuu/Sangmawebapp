
'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signOut, type User as FirebaseUser } from 'firebase/auth';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from '@/components/ui/button';
import { LogOut, User, MapPin, Phone, Building, Save, Loader2, ShoppingBag, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getUserProfile, updateUserProfile, type UserProfileData } from '@/lib/user';
import { useToast } from '@/hooks/use-toast';
import { listenToUserOrders } from '@/lib/data-realtime';
import type { Order } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';

function ProfileContent() {
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [profile, setProfile] = useState<Partial<UserProfileData>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        const userProfile = await getUserProfile(currentUser.uid);
        setProfile(userProfile || {});
        
        const unsubscribeOrders = listenToUserOrders(currentUser.uid, (userOrders) => {
          setOrders(userOrders);
          setLoading(false);
        });

        return () => unsubscribeOrders();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, profile);
      toast({ title: "Profile Updated", description: "Your information has been saved." });
    } catch (error) {
      toast({ variant: 'destructive', title: "Update Failed", description: "Could not save your profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.id]: e.target.value });
  };
  
  const handleRegionChange = (value: string) => {
    setProfile({ ...profile, region: value });
  };

  const getInitials = (emailOrPhone: string | null | undefined) => {
    if (!emailOrPhone) return 'U';
    const namePart = emailOrPhone.split('@')[0];
    return namePart.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <div className="p-4 flex flex-col items-center text-center border-b">
        <Avatar className="h-20 w-20 mb-3">
          <AvatarImage
            src={user.photoURL || `https://placehold.co/100x100.png`}
            alt="User Profile"
            data-ai-hint="user avatar"
          />
          <AvatarFallback>
            {user.email || user.phoneNumber ? (
              getInitials(user.email || user.phoneNumber)
            ) : (
              <User className="h-10 w-10" />
            )}
          </AvatarFallback>
        </Avatar>
        <p className="font-semibold">{user.displayName || user.email || user.phoneNumber}</p>
        <p className="text-xs text-muted-foreground">Welcome back!</p>
      </div>
      <Tabs defaultValue="account" className="w-full flex flex-col flex-1 overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 mt-2">
          <TabsTrigger value="account">My Account</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="flex-1 overflow-y-auto mt-0">
          <div className="p-4 space-y-6">
            <div className="space-y-4">
              <Label>Contact Information</Label>
              <div className="relative">
                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input id="phone" value={profile.phone || ''} onChange={handleInputChange} placeholder="Phone Number" className="pl-9" />
              </div>
            </div>
            <div className="space-y-4">
              <Label>Delivery Address</Label>
               <div className="relative">
                 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input id="address" value={profile.address || ''} onChange={handleInputChange} placeholder="House No, Street Name" className="pl-9" />
              </div>
              <div className="relative">
                 <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input id="landmark" value={profile.landmark || ''} onChange={handleInputChange} placeholder="Landmark (Optional)" className="pl-9" />
              </div>
              <Select value={profile.region || ''} onValueChange={handleRegionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="North Tura">North Tura</SelectItem>
                  <SelectItem value="South Tura">South Tura</SelectItem>
                  <SelectItem value="Tura NEHU">Tura NEHU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveProfile} className="w-full" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="orders" className="flex-1 overflow-y-auto mt-0">
          <ScrollArea className="h-full">
            {orders.length > 0 ? (
              <div className="p-4 space-y-3">
                {orders.map(order => (
                   <div key={order.id} className="border rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center font-semibold">
                       <span>Order #{order.id}</span>
                       <span>INR {order.grandTotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                       <span>{order.createdAt ? format(order.createdAt.toDate(), 'PPP') : 'Date unavailable'}</span>
                       <span>{order.status}</span>
                     </div>
                   </div>
                ))}
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                <ShoppingBag className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No Orders Yet</h3>
                <p className="text-sm">Your past orders will appear here.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <div className="p-4 border-t bg-background mt-auto">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  )
}

export function ProfileSheet({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return null;
  }
  
  if (isMobile === undefined) return null;

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="h-[90vh] flex flex-col p-0">
          <div className="flex-1 min-h-0">
            <ProfileContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Fallback to Sheet for desktop (though not currently used in header)
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-[400px] flex flex-col p-0"
        showCloseButton={true}
      >
        <div className="flex flex-col justify-between flex-1">
          <ProfileContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
