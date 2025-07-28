
'use client';

import { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Address } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

type LocationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: Address | null;
  onSave: (newLocation: Omit<Address, 'id' | 'isDefault'>) => void;
};

export default function LocationSheet({ open, onOpenChange, address, onSave }: LocationSheetProps) {
  const { user } = useAuth();
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [region, setRegion] = useState('South Tura');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (address) {
      setArea(address.area);
      setLandmark(address.landmark || '');
      setRegion(address.region);
      setPhone(address.phone || user?.phoneNumber || '');
    } else {
        setPhone(user?.phoneNumber || '');
    }
  }, [address, user]);

  const handleSave = () => {
    if (!area || !region || !phone) {
        // Simple validation feedback
        alert("Please fill in all required fields.");
        return;
    }
    const newLocation = { area, landmark, region, phone };
    onSave(newLocation);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="h-auto flex flex-col p-0 rounded-t-2xl"
      >
        <DrawerHeader className="p-4 pt-0 text-center">
          <DrawerTitle>Enter Your Delivery Details</DrawerTitle>
          <DrawerDescription>This will be saved to your address book.</DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-4 p-4">
          <div className="space-y-1">
            <Label htmlFor="area">Area</Label>
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g., Chandmari"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="landmark">Landmark (Optional)</Label>
            <Input
              id="landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g., Near Traffic Point"
            />
          </div>
          <div className="space-y-1">
            <Label>Region</Label>
            <Select value={region} onValueChange={(value) => setRegion(value as Address['region'])}>
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
           <div className="space-y-1">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 123 456 7890"
            />
          </div>
        </div>
        <DrawerFooter className="p-4 border-t bg-background mt-auto">
          <Button
            type="button"
            onClick={handleSave}
            className="w-full"
            disabled={!area || !region || !phone}
          >
            Save location
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
