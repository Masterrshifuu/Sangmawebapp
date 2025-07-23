
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

type LocationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  onSave: (newLocation: string) => void;
};

export default function LocationSheet({ open, onOpenChange, location, onSave }: LocationSheetProps) {
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [turaRegion, setTuraRegion] = useState('');

  useEffect(() => {
    const parts = location.split(', ');
    if (parts.length === 2) {
      setArea(parts[0]);
      setTuraRegion(parts[1]);
    } else {
        setArea(location);
        setTuraRegion('');
    }
  }, [location]);

  const handleSave = () => {
    const newLocation = `${area}, ${turaRegion}`;
    onSave(newLocation);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="h-auto flex flex-col p-0 rounded-t-2xl"
      >
        <DrawerHeader className="p-4 pt-0 text-center">
          <DrawerTitle>Enter your location</DrawerTitle>
          <DrawerDescription>
            Provide your area and add landmark to get accurate
            delivery times.
          </DrawerDescription>
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
            <Label htmlFor="landmark">Landmark</Label>
            <Input
              id="landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1">
            <Label>Region</Label>
            <Select value={turaRegion} onValueChange={setTuraRegion}>
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
        </div>
        <DrawerFooter className="p-4 border-t bg-background mt-auto">
          <Button
            type="button"
            onClick={handleSave}
            className="w-full"
          >
            Save location
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
