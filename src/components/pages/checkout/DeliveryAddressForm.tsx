

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Address } from '@/lib/types';
import { useLocation } from '@/hooks/use-location';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';
import { getUserData } from '@/lib/user';

const addressSchema = z.object({
  name: z.string().min(2, 'Please enter your full name.'),
  area: z.string().min(3, 'Area is required'),
  landmark: z.string().optional(),
  region: z.enum(['North Tura', 'South Tura', 'Tura NEHU'], {
      errorMap: () => ({ message: "Please select a region."})
  }),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number.'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const AddressDisplay = ({ address, onEdit }: { address: Address; onEdit: () => void }) => (
    <div className="flex justify-between items-start p-4 border rounded-lg">
        <div>
            <p className="font-semibold">{address.name}</p>
            <p className="text-sm text-muted-foreground">{address.area}</p>
            <p className="text-sm text-muted-foreground">{address.landmark ? `${address.landmark}, ` : ''}{address.region}</p>
            <p className="text-sm text-muted-foreground">{address.phone}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>Change</Button>
    </div>
);

const AddressForm = ({ initialData, showNameField, onFormChange }: { initialData: Partial<AddressFormValues>, showNameField: boolean, onFormChange: (data: Address | null) => void }) => {
    const { address: savedAddress } = useLocation();

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: initialData,
        mode: 'onChange'
    });
    
    useEffect(() => {
        form.reset(initialData);
    }, [initialData, form]);

    const formValues = form.watch();
    const debouncedFormValues = useDebounce(formValues, 500);

    useEffect(() => {
        const handleFormUpdate = async () => {
            const isValid = await form.trigger();
            if (isValid) {
                const currentValues = form.getValues();
                const newAddress: Address = {
                    id: savedAddress?.id || '',
                    isDefault: savedAddress?.isDefault || false,
                    ...currentValues,
                };
                onFormChange(newAddress);
            } else {
                onFormChange(null);
            }
        };

        handleFormUpdate();
        
    }, [debouncedFormValues, form, onFormChange, savedAddress]);


    return (
        <Form {...form}>
            <form className="space-y-4">
                {showNameField && (
                     <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                )}
                <FormField control={form.control} name="area" render={({ field }) => (
                    <FormItem><FormLabel>Area/Locality</FormLabel><FormControl><Input placeholder="e.g., Chandmari" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="landmark" render={({ field }) => (
                    <FormItem><FormLabel>Landmark (Optional)</FormLabel><FormControl><Input placeholder="e.g., Near Traffic Point" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="region" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Region</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a region" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="North Tura">North Tura</SelectItem>
                                <SelectItem value="South Tura">South Tura</SelectItem>
                                <SelectItem value="Tura NEHU">Tura NEHU</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+91 123 456 7890" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </form>
        </Form>
    );
};

export function DeliveryAddressForm({ onAddressChange }: { onAddressChange: (address: Address | null) => void; }) {
    const { user, loading: authLoading } = useAuth();
    const { address: savedAddress, loading: locationLoading } = useLocation();
    const [isEditing, setIsEditing] = useState(false);
    const [showNameField, setShowNameField] = useState(false);

    useEffect(() => {
        const checkUserHistory = async () => {
            if (!user) {
                setShowNameField(true); // Always show for guests
                return;
            }
            const userData = await getUserData(user.uid);
            setShowNameField(userData.totalOrders === 0);
        };

        if (!authLoading) {
            checkUserHistory();
        }
    }, [user, authLoading]);

    useEffect(() => {
        // Automatically enter edit mode if there is no saved address for a logged-in user,
        // or for any guest user.
        if (!authLoading && !locationLoading) {
            if (!savedAddress || !user) {
                setIsEditing(true);
            } else {
                setIsEditing(false);
            }
        }
    }, [user, savedAddress, authLoading, locationLoading]);

    // Ensure the parent checkout page knows about the address immediately on load
    useEffect(() => {
        if (savedAddress) {
            onAddressChange(savedAddress);
        } else {
            onAddressChange(null);
        }
    }, [savedAddress, onAddressChange]);
  
    if (authLoading || locationLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    const initialData = {
        ...savedAddress,
        name: savedAddress?.name || user?.displayName || '',
        phone: savedAddress?.phone || user?.phoneNumber || '',
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
                <CardDescription>Where should we send your order?</CardDescription>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <AddressForm 
                        initialData={initialData} 
                        showNameField={showNameField}
                        onFormChange={onAddressChange}
                    />
                ) : savedAddress ? (
                    <AddressDisplay address={savedAddress} onEdit={() => setIsEditing(true)} />
                ) : (
                    <p className="text-muted-foreground text-sm">Loading address...</p>
                )}
            </CardContent>
        </Card>
    );
}
