'use client';

// This component is no longer used in the main application flow
// but is kept to avoid breaking changes if it were referenced elsewhere.
// The main profile view is now a dedicated page.

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { signOut, type User as FirebaseUser } from 'firebase/auth';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { Button } from '@/components/ui/button';
import { LogOut, User, MapPin, Phone, Building, Save, Loader2, ShoppingBag, ChevronRight, X, ChevronDown } from 'lucide-react';
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
import { updateOrderStatus } from '@/lib/orders';
import type { Order } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from './ui/separator';


function ProfileContent() {
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [profile, setProfile] = useState<Partial<UserProfileData>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

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
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
      toast({ variant: 'destructive', title: 'Sign Out Failed', description: 'Could not sign you out. Please try again.' });
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
  
  const handleCancelOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'Cancelled');
      toast({ title: "Order Cancelled", description: `Order #${orderId} has been cancelled.` });
    } catch (error) {
       toast({ variant: 'destructive', title: "Cancellation Failed", description: "Could not cancel the order." });
    }
  }

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
      <Tabs defaultValue="account" className="w-full flex flex-col flex-1 min-h-0">
        <TabsList className="grid w-full grid-cols-2 mt-2 shrink-0">
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
        <TabsContent value="orders" className="flex-1 flex flex-col mt-0 min-h-0">
          <ScrollArea className="h-full">
            {orders.length > 0 ? (
              <div className="p-4 space-y-3">
                {orders.map(order => {
                   const canCancel = order.status === 'Pending' || order.status === 'Confirmed';
                   return (
                     <Collapsible key={order.id} className="border rounded-lg text-sm">
                        <div className="p-3 space-y-2">
                           <div className="flex justify-between items-center font-semibold">
                             <span>Order #{order.id}</span>
                             <span>INR {(order.grandTotal || 0).toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between items-center text-xs text-muted-foreground">
                             <span>{order.createdAt ? format(order.createdAt.toDate(), 'PPP') : 'Date unavailable'}</span>
                             <span className="font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{order.status}</span>
                           </div>
                        </div>

                        <CollapsibleContent className="px-3 pb-3">
                          <div className="space-y-2 pt-2 border-t">
                             <h4 className="font-semibold text-xs text-muted-foreground">Items</h4>
                             {order.items.map(item => (
                               <div key={item.id} className="flex justify-between items-center text-xs">
                                 <span className="flex-1 truncate pr-2">{item.name} (x{item.quantity})</span>
                                 <span className="font-mono">INR {(item.price * item.quantity).toFixed(2)}</span>
                               </div>
                             ))}
                             <Separator className="my-2"/>
                              <div className="flex justify-between items-center text-xs">
                                <span>Subtotal</span>
                                <span className='font-mono'>INR {(order.subtotal || 0).toFixed(2)}</span>
                              </div>
                               <div className="flex justify-between items-center text-xs">
                                <span>Delivery Fee</span>
                                <span className='font-mono'>INR {(order.deliveryCharge || 0).toFixed(2)}</span>
                              </div>
                               <div className="flex justify-between items-center text-xs font-bold text-foreground">
                                <span>Grand Total</span>
                                <span className='font-mono'>INR {(order.grandTotal || 0).toFixed(2)}</span>
                              </div>
                          </div>
                        </CollapsibleContent>
                        
                       <div className="flex border-t">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex-1 rounded-none rounded-bl-md text-xs group">
                              <span className="mr-2">View Details</span>
                              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </Button>
                          </CollapsibleTrigger>
                          <div className="w-px bg-border"/>
                          <DrawerClose asChild>
                            <Button variant="ghost" size="sm" className="flex-1 rounded-none text-xs" onClick={() => router.push('/track-order')}>
                                Track Order
                            </Button>
                          </DrawerClose>
                          {canCancel && (
                            <>
                              <div className="w-px bg-border"/>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="flex-1 rounded-none rounded-br-md text-xs text-destructive hover:text-destructive">
                                      <X className="mr-1 h-3 w-3" />
                                      Cancel
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently cancel your order.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCancelOrder(order.id)}>
                                      Yes, Cancel Order
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              </>
                          )}
                       </div>
                     </Collapsible>
                   )
                })}
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
      <DrawerFooter>
        <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
        >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
        </Button>
      </DrawerFooter>
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
        <DrawerContent className="max-h-[90vh] flex flex-col p-0">
           <DrawerHeader>
                <DrawerTitle>My Account</DrawerTitle>
           </DrawerHeader>
          <div className="flex-1 min-h-0 flex flex-col">
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
        <SheetHeader>
            <SheetTitle>My Account</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col justify-between flex-1">
          <ProfileContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
