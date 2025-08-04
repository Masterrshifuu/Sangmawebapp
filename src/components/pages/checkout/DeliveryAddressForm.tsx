

'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import type { Address } from '@/lib/types';
import { useLocation } from '@/hooks/use-location';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const addressSchema = z.object({
  area: z.string().min(3, 'Area is required'),
  landmark: z.string().optional(),
  region: z.enum(['North Tura', 'South Tura', 'Tura NEHU'], {
      errorMap: () => ({ message: "Please select a region."})
  }),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid phone number.'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface DeliveryAddressFormProps {
  onAddressChange: (address: Address | null) => void;
}

const AddressForm = ({ initialData, onSave, onCancel }: { initialData: Partial<AddressFormValues>, onSave: (data: AddressFormValues) => void, onCancel?: () => void }) => {
    const { register, handleSubmit, control, formState: { errors } } = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            area: initialData.area || '',
            landmark: initialData.landmark || '',
            region: initialData.region || undefined,
            phone: initialData.phone || ''
        }
    });

    const regionValue = useWatch({ control, name: 'region' });

    return (
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
             <div className="space-y-1">
                <label htmlFor="area" className="text-sm font-medium">Area</label>
                <Input id="area" placeholder="e.g., Chandmari" {...register('area')} />
                {errors.area && <p className="text-sm text-destructive">{errors.area.message}</p>}
            </div>
            <div className="space-y-1">
                <label htmlFor="landmark" className="text-sm font-medium">Landmark (Optional)</label>
                <Input id="landmark" placeholder="e.g., Near Traffic Point" {...register('landmark')} />
            </div>
            <div className="space-y-1">
                 <label className="text-sm font-medium">Region</label>
                 <Select value={regionValue} onValueChange={(val) => handleSubmit(() => {})}>{/* Hack to trigger re-render on change */}
                    <SelectTrigger {...register('region')}>
                        <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="North Tura">North Tura</SelectItem>
                        <SelectItem value="South Tura">South Tura</SelectItem>
                        <SelectItem value="Tura NEHU">Tura NEHU</SelectItem>
                    </SelectContent>
                </Select>
                {errors.region && <p className="text-sm text-destructive">{errors.region.message}</p>}
            </div>
             <div className="space-y-1">
                <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                <Input id="phone" type="tel" placeholder="+91 123 456 7890" {...register('phone')} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
                {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
                <Button type="submit">Save Address</Button>
            </div>
        </form>
    );
};


export function DeliveryAddressForm({ onAddressChange }: DeliveryAddressFormProps) {
  const { user } = useAuth();
  const { address: defaultAddress, loading } = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // If a default address exists, use it. Otherwise, enter edit mode.
    if (!loading && !defaultAddress) {
        setIsEditing(true);
    }
     if (!loading && defaultAddress) {
        onAddressChange(defaultAddress);
        setIsEditing(false);
    }
  }, [defaultAddress, loading, onAddressChange]);

  const handleSave = (data: AddressFormValues) => {
    const newAddress: Address = {
        id: defaultAddress?.id || 'new-address',
        isDefault: defaultAddress?.isDefault || true,
        ...data,
    };
    onAddressChange(newAddress);
    setIsEditing(false);
  };
  
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
            {defaultAddress && !isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Change</Button>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
            <AddressForm 
                initialData={defaultAddress || { phone: user?.phoneNumber || '' }} 
                onSave={handleSave}
                onCancel={defaultAddress ? () => setIsEditing(false) : undefined}
            />
        ) : defaultAddress ? (
            <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{defaultAddress.area}</p>
                <p>{defaultAddress.landmark ? `${defaultAddress.landmark}, ` : ''}{defaultAddress.region}</p>
                <p>{defaultAddress.phone}</p>
            </div>
        ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
                <p>No address found. Please add one.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
