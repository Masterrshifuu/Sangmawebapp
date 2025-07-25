
'use client';

import { MapPin, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import LocationSheet from '@/components/location-sheet';
import { useLocation } from '@/hooks/use-location';

export function LocationPicker() {
    const { location, setLocation } = useLocation();
    const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);

    const handleSaveLocation = (newLocation: string) => {
        setLocation(newLocation);
        setIsLocationSheetOpen(false);
    };

    return (
        <>
            <button onClick={() => setIsLocationSheetOpen(true)} className="flex items-center mt-1 max-w-[250px] h-auto bg-transparent p-0">
                <MapPin className="ml-0 w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
                <span className="bg-transparent border-none focus:ring-0 w-full text-sm text-muted-foreground truncate px-2 outline-none text-left">
                    {location}
                </span>
                <ChevronDown className="mr-2 w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
            </button>
            <LocationSheet
                open={isLocationSheetOpen}
                onOpenChange={setIsLocationSheetOpen}
                location={location}
                onSave={handleSaveLocation}
            />
        </>
    );
}
