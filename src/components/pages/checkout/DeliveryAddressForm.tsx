

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import type { Address } from '@/lib/types';
import { useLocation } from '@/hooks/use-location';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { v4 as uuidv4 } from 'uuid';

const addressSchema = z.object({
  area: z.string().min(3, 'Area is required'),
  landmark: z.string().optional(),
  region: z.enum(['North Tura', 'South Tura', 'Tura NEHU'], {
      errorMap: () => ({ message: "Please select a region."})
  }),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number.'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const AddressForm = ({ initialData, onFormChange }: { initialData: Partial<AddressFormValues>, onFormChange: (data: AddressFormValues) => void }) => {
    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            area: initialData.area || '',
            landmark: initialData.landmark || '',
            region: initialData.region || undefined,
            phone: initialData.phone || ''
        },
        mode: 'onChange'
    });

    const watchedValues = form.watch();

    useEffect(() => {
        if (form.formState.isValid) {
            onFormChange(watchedValues);
        }
    }, [watchedValues, form.formState.isValid, onFormChange]);

    return (
        <Form {...form}>
            <form className="space-y-4">
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
  const { user } = useAuth();
  const { address: defaultAddress, loading } = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  
  // This state will hold the address for the current order
  const [currentOrderAddress, setCurrentOrderAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (!loading) {
        if (defaultAddress) {
            setCurrentOrderAddress(defaultAddress);
            onAddressChange(defaultAddress);
            setIsEditing(false);
        } else {
            // No default address, or user is a guest. Start with an empty form.
            setIsEditing(true);
            onAddressChange(null);
        }
    }
  }, [defaultAddress, loading, onAddressChange]);

  const handleFormChange = useCallback((data: AddressFormValues) => {
    const newAddress: Address = {
      id: currentOrderAddress?.id || uuidv4(),
      isDefault: currentOrderAddress?.isDefault ?? false, // Preserve default status
      ...data,
    };
    setCurrentOrderAddress(newAddress);
    onAddressChange(newAddress);
  }, [currentOrderAddress, onAddressChange]);
  
  if (loading) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Delivery Address</CardTitle>
                <CardDescription>Where should we send your order?</CardDescription>
            </div>
            {currentOrderAddress && !isEditing && user && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Change</Button>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
            <AddressForm 
                initialData={currentOrderAddress || { phone: user?.phoneNumber || '' }} 
                onFormChange={handleFormChange}
            />
        ) : currentOrderAddress ? (
            <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{currentOrderAddress.area}</p>
                <p>{currentOrderAddress.landmark ? `${currentOrderAddress.landmark}, ` : ''}{currentOrderAddress.region}</p>
                <p>{currentOrderAddress.phone}</p>
            </div>
        ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
                <p>Please provide a delivery address.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
