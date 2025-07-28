
'use client';

import { useState } from 'react';
import type { User } from 'firebase/auth';
import type { UserData, Address } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { updateAddresses } from '@/lib/account-actions';
import { v4 as uuidv4 } from 'uuid';

const addressSchema = z.object({
  type: z.enum(['Home', 'Work', 'Other']),
  line1: z.string().min(3, 'Address line is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
});

const AddressForm = ({ address, onSave, onCancel }: { address?: Address; onSave: (data: Address) => void; onCancel: () => void; }) => {
  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: address?.type || 'Home',
      line1: address?.line1 || '',
      line2: address?.line2 || '',
      city: address?.city || '',
      pincode: address?.pincode || '',
    },
  });

  const onSubmit = (data: z.infer<typeof addressSchema>) => {
    onSave({
        id: address?.id || uuidv4(),
        ...data,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-secondary/30 mt-4">
        <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
                <FormLabel>Address Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </FormItem>
        )} />
        <FormField control={form.control} name="line1" render={({ field }) => (
            <FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="line2" render={({ field }) => (
            <FormItem><FormLabel>Address Line 2 (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="city" render={({ field }) => (
            <FormItem><FormLabel>City / Town</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="pincode" render={({ field }) => (
            <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
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

  const handleSave = async (address: Address) => {
    let newAddresses;
    if (addresses.some(a => a.id === address.id)) {
      newAddresses = addresses.map(a => a.id === address.id ? address : a);
    } else {
      newAddresses = [...addresses, address];
    }
    await updateAddresses(user.uid, newAddresses);
    setAddresses(newAddresses);
    setEditingAddress(null);
  };
  
  const handleDelete = async (addressId: string) => {
    const newAddresses = addresses.filter(a => a.id !== addressId);
    await updateAddresses(user.uid, newAddresses);
    setAddresses(newAddresses);
  };

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div key={address.id} className="p-3 border rounded-md flex justify-between items-start">
          <div>
            <p className="font-semibold">{address.type}</p>
            <p className="text-sm">{address.line1}, {address.line2 ? `${address.line2}, ` : ''}{address.city} - {address.pincode}</p>
          </div>
          <div className="flex gap-1">
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
