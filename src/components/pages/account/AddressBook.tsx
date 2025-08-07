
'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { UserData, Address } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { updateAddresses } from '@/lib/account-actions';
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from '@/hooks/use-location';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const addressSchema = z.object({
  name: z.string().min(2, 'Please enter your full name.'),
  area: z.string().min(3, 'Area is required'),
  landmark: z.string().optional(),
  region: z.enum(['North Tura', 'South Tura', 'Tura NEHU']),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number.'),
});

const AddressForm = ({ address, onSave, onCancel }: { address?: Address; onSave: (data: Address) => void; onCancel: () => void; }) => {
  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: address?.name || '',
      area: address?.area || '',
      landmark: address?.landmark || '',
      region: address?.region || 'South Tura',
      phone: address?.phone || '',
    },
  });

  const onSubmit = (data: z.infer<typeof addressSchema>) => {
    onSave({
        id: address?.id || uuidv4(),
        isDefault: address?.isDefault || false,
        ...data,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-secondary/30 mt-4">
        <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your Name" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

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
            </FormItem>
        )} />
        <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+91 123 456 7890" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save Address</Button>
        </div>
      </form>
    </Form>
  );
};

export function AddressBook({ user, userData }: { user: User; userData: UserData }) {
  const [addresses, setAddresses] = useState(userData.addresses || []);
  const [editingAddress, setEditingAddress] = useState<Address | 'new' | null>(null);
  const { setAddress: setGlobalAddress, loading: locationLoading } = useLocation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSave = async (addressData: Address) => {
    // Ensure there is always an ID
    const addressToSave = { ...addressData, id: addressData.id || uuidv4() };

    let newAddresses;
    const existingIndex = addresses.findIndex(a => a.id === addressToSave.id);

    if (existingIndex > -1) {
        newAddresses = addresses.map((a, index) => index === existingIndex ? addressToSave : a);
    } else {
        // If adding a new address, make it the default if it's the first one
        if (addresses.length === 0) {
            addressToSave.isDefault = true;
        }
        newAddresses = [...addresses, addressToSave];
    }
    
    await updateAddresses(user.uid, newAddresses);
    setAddresses(newAddresses);
    setEditingAddress(null);
    
    // If the saved address is the default, update the global state
    if (addressToSave.isDefault) {
        setGlobalAddress(addressToSave);
    }
  };
  
  const handleDelete = async (addressId: string) => {
    const newAddresses = addresses.filter(a => a.id !== addressId);
    await updateAddresses(user.uid, newAddresses);
    setAddresses(newAddresses);
  };

  const handleSetDefault = async (addressId: string) => {
    const newAddresses = addresses.map(a => ({
        ...a,
        isDefault: a.id === addressId
    }));
    await updateAddresses(user.uid, newAddresses);
    setAddresses(newAddresses);
    const newDefault = newAddresses.find(a => a.isDefault);
    if (newDefault) {
        setGlobalAddress(newDefault);
    }
  }

  if (!isClient || locationLoading) {
      return (
          <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
          </div>
      )
  }

  return (
    <div className="space-y-4">
        {addresses.length === 0 && !editingAddress && (
            <p className="text-sm text-muted-foreground text-center py-4">You have no saved addresses. Add one below!</p>
        )}

      {addresses.map((address) => (
        <div key={address.id} className="p-3 border rounded-md flex justify-between items-start">
          <div className="flex-1">
            <p className="font-semibold">{address.name}</p>
            <p className="text-sm text-muted-foreground">{address.area}</p>
            <p className="text-sm text-muted-foreground">{address.landmark ? `${address.landmark}, ` : ''}{address.region}</p>
            <p className="text-sm text-muted-foreground">{address.phone}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleSetDefault(address.id)}
                title="Set as default"
            >
                {address.isDefault ? <CheckCircle className="text-green-600" /> : <Circle className="text-muted-foreground" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingAddress(address)}><Edit /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(address.id)}><Trash2 /></Button>
          </div>
        </div>
      ))}

      {editingAddress ? (
        <AddressForm
            address={editingAddress === 'new' ? undefined : editingAddress}
            onSave={handleSave}
            onCancel={() => setEditingAddress(null)}
        />
      ) : (
        <Button variant="outline" className="w-full mt-4" onClick={() => setEditingAddress('new')}>
            <Plus className="mr-2" /> Add New Address
        </Button>
      )}
    </div>
  );
}
