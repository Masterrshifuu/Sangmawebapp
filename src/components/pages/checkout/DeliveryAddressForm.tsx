

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

interface DeliveryAddressFormProps {
  onAddressChange: (address: Address | null) => void;
}

const AddressForm = ({ initialData, onSave, onCancel }: { initialData: Partial<AddressFormValues>, onSave: (data: AddressFormValues) => void, onCancel?: () => void }) => {
    const { register, control, formState: { errors, isValid } } = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            area: initialData.area || '',
            landmark: initialData.landmark || '',
            region: initialData.region || undefined,
            phone: initialData.phone || ''
        },
        mode: 'onChange' // Validate on change to enable autosave
    });
    
    const formValues = useWatch({ control });
    const debouncedFormValues = useDebounce(formValues, 500);

    useEffect(() => {
        if (isValid) {
            onSave(debouncedFormValues as AddressFormValues);
        }
    }, [debouncedFormValues, isValid, onSave]);


    return (
        <form className="space-y-4">
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
                 <Select
                    onValueChange={(value) => register('region').onChange({ target: { name: 'region', value } })}
                    defaultValue={initialData.region}
                 >
                    <SelectTrigger>
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
        </form>
    );
};


export function DeliveryAddressForm({ onAddressChange }: DeliveryAddressFormProps) {
  const { user } = useAuth();
  const { address: defaultAddress, loading } = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [localAddress, setLocalAddress] = useState<Address | null>(defaultAddress);

  useEffect(() => {
    // If a default address exists, use it. Otherwise, enter edit mode.
    if (!loading && !defaultAddress) {
        setIsEditing(true);
    }
     if (!loading && defaultAddress) {
        setLocalAddress(defaultAddress);
        onAddressChange(defaultAddress);
        setIsEditing(false);
    }
  }, [defaultAddress, loading, onAddressChange]);

  const handleSave = (data: AddressFormValues) => {
    const newAddress: Address = {
        id: defaultAddress?.id || 'new-address',
        isDefault: defaultAddress?.isDefault ?? true,
        ...data,
    };
    setLocalAddress(newAddress);
    onAddressChange(newAddress);
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
            {localAddress && !isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Change</Button>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
            <AddressForm 
                initialData={localAddress || { phone: user?.phoneNumber || '' }} 
                onSave={handleSave}
            />
        ) : localAddress ? (
            <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{localAddress.area}</p>
                <p>{localAddress.landmark ? `${localAddress.landmark}, ` : ''}{localAddress.region}</p>
                <p>{localAddress.phone}</p>
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
