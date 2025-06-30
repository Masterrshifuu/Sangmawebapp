'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import { MapPin, ChevronDown } from 'lucide-react';

type LocationSheetProps = {
  location: string;
  onSave: (newLocation: string) => void;
};

export default function LocationSheet({ location, onSave }: LocationSheetProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    setIsDialogOpen(false);
  };

  return (
    <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center mt-1 max-w-[250px] h-8 bg-transparent p-0">
          <MapPin className="ml-0 w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
          <span className="bg-transparent border-none focus:ring-0 w-full text-sm text-muted-foreground truncate px-2 outline-none text-left">
            {location}
          </span>
          <ChevronDown className="mr-2 w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-auto flex flex-col p-0 rounded-t-2xl"
      >
        <div className="flex justify-center py-3">
          <SheetClose>
            <div className="w-12 h-1.5 rounded-full bg-muted" />
          </SheetClose>
        </div>
        <SheetHeader className="p-4 pt-0 text-center">
          <SheetTitle>Enter your location</SheetTitle>
          <SheetDescription>
            Provide your area and add landmark to get accurate
            delivery times.
          </SheetDescription>
        </SheetHeader>
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
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter className="p-4 border-t bg-background mt-auto">
          <Button
            type="button"
            onClick={handleSave}
            className="w-full"
          >
            Save location
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
