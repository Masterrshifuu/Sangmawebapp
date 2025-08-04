

'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import type { Address } from '@/lib/types';
import { useLocation } from '@/hooks/use-location';

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

export function DeliveryAddressForm({ onAddressChange }: DeliveryAddressFormProps) {
  const { user } = useAuth();
  const { address: defaultAddress } = useLocation();

  const { register, control, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
        area: defaultAddress?.area || '',
        landmark: defaultAddress?.landmark || '',
        region: defaultAddress?.region,
        phone: defaultAddress?.phone || user?.phoneNumber || '',
    },
  });

  const watchedValues = useWatch({ control });

  useEffect(() => {
    const { success } = addressSchema.safeParse(watchedValues);
    if (success) {
      onAddressChange({
        id: 'checkout-address',
        isDefault: false,
        ...watchedValues as AddressFormValues,
      });
    } else {
      onAddressChange(null);
    }
  }, [watchedValues, onAddressChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Address</CardTitle>
        <CardDescription>Where should we send your order?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="area">Area</Label>
          <Input id="area" placeholder="e.g., Chandmari" {...register('area')} />
          {errors.area && <p className="text-sm text-destructive">{errors.area.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="landmark">Landmark (Optional)</Label>
          <Input id="landmark" placeholder="e.g., Near Traffic Point" {...register('landmark')} />
        </div>
        <div className="space-y-1">
          <Label>Region</Label>
          <Select onValueChange={(value) => register('region').onChange({ target: { name: 'region', value }})} defaultValue={defaultAddress?.region}>
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
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" type="tel" placeholder="+91 123 456 7890" {...register('phone')} />
           {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
