
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/hooks/use-location";
import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Address } from "@/lib/types";

const addressSchema = z.object({
  name: z.string().min(2, 'Full name is required.'),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Please enter a valid 10-digit phone number.'),
  area: z.string().min(3, 'Area or locality is required.'),
  landmark: z.string().optional(),
  region: z.enum(['North Tura', 'South Tura', 'Tura NEHU'], {
    required_error: "You must select a delivery region."
  }),
});

type FormValues = z.infer<typeof addressSchema>;

export function DeliveryAddressForm({ onAddressChange }: { onAddressChange: (address: Address | null) => void }) {
  const { address: initialAddress, loading } = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      phone: '',
      area: '',
      landmark: '',
      region: undefined,
    },
    mode: 'onChange' // Validate on change to provide real-time feedback
  });

  // Effect to populate form with address from location context once loaded
  useEffect(() => {
    if (initialAddress && !loading) {
      form.reset({
        name: initialAddress.name || '',
        phone: initialAddress.phone || '',
        area: initialAddress.area || '',
        landmark: initialAddress.landmark || '',
        region: initialAddress.region || undefined,
      });
    }
  }, [initialAddress, loading, form]);

  // Effect to notify parent component of changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      const isValid = addressSchema.safeParse(value).success;
      if (isValid) {
        onAddressChange({
            id: initialAddress?.id || '',
            isDefault: initialAddress?.isDefault || false,
            ...value
        } as Address);
      } else {
        onAddressChange(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onAddressChange, initialAddress]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Address...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
            <CardDescription>Where should we send your order?</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form className="space-y-4">
                     <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl><Input type="tel" placeholder="10-digit mobile number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="area" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Area / Locality</FormLabel>
                            <FormControl><Input placeholder="e.g., Chandmari" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="landmark" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Landmark (Optional)</FormLabel>
                            <FormControl><Input placeholder="e.g., Near DC Office" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="region" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Region</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a delivery region" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="North Tura">North Tura</SelectItem>
                                    <SelectItem value="South Tura">South Tura</SelectItem>
                                    <SelectItem value="Tura NEHU">Tura NEHU</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
