

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
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/use-auth';
import { useDebounce } from '@/hooks/use-debounce';

const addressSchema = z.object({
  area: z.string().min(3, 'Area is required'),
  landmark: z.string().optional(),
  region: z.enum(['North Tura', 'South Tura', 'Tura NEHU'], {
      errorMap: () => ({ message: "Please select a region."})
  }),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number.'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const AddressForm = ({ initialData, onFormChange, isUserLoggedIn }: { initialData: Partial<AddressFormValues>, onFormChange: (data: Address | null) => void, isUserLoggedIn: boolean }) => {
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
        const checkValidityAndSaveChanges = async () => {
            const isValid = await form.trigger(); // Manually trigger validation
            if (isValid) {
                const newAddress: Address = {
                    id: (initialData as Address)?.id || uuidv4(),
                    isDefault: (initialData as Address)?.isDefault ?? !isUserLoggedIn,
                    ...form.getValues(),
                };
                onFormChange(newAddress);
            } else {
                 onFormChange(null);
            }
        };

        checkValidityAndSaveChanges();
        
    }, [debouncedFormValues, form, onFormChange, initialData, isUserLoggedIn]);


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
  const { user, loading: authLoading } = useAuth();
  const { address: savedAddress, setAddress, loading: locationLoading } = useLocation();

  const handleFormChange = useCallback((newAddress: Address | null) => {
    setAddress(newAddress);
    onAddressChange(newAddress);
  }, [setAddress, onAddressChange]);
  
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Delivery Address</CardTitle>
                <CardDescription>Where should we send your order?</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
          <AddressForm 
              initialData={savedAddress || { phone: user?.phoneNumber || '' }} 
              onFormChange={handleFormChange}
              isUserLoggedIn={!!user}
          />
      </CardContent>
    </Card>
  );
}
