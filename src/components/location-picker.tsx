
'use client';

import { MapPin, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import LocationSheet from '@/components/location-sheet';
import { useLocation } from '@/hooks/use-location';
import { useAuth } from '@/hooks/use-auth';
import type { Address } from '@/lib/types';
import { updateAddresses } from '@/lib/account-actions';
import { getUserData } from '@/lib/user';
import { v4 as uuidv4 } from 'uuid';

export function LocationPicker() {
    const { address, setAddress, loading } = useLocation();
    const { user } = useAuth();
    const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);

    const handleSaveLocation = async (newLocationData: Omit<Address, 'id' | 'isDefault'>) => {
        setIsLocationSheetOpen(false);

        if (user) {
            const userData = await getUserData(user.uid);
            const existingAddresses = userData.addresses || [];

            const newAddress: Address = {
                ...newLocationData,
                id: uuidv4(),
                isDefault: true,
            };
            
            // Make all other addresses not default
            const updatedAddresses = existingAddresses.map(a => ({ ...a, isDefault: false }));
            updatedAddresses.push({
              ...newAddress,
              isDefault: newAddress.isDefault ?? false
            });
            
            await updateAddresses(user.uid, updatedAddresses);
            setAddress(newAddress); // Update context
        } else {
            // Guest user, just update local state/storage
            const newAddress: Address = {
                ...newLocationData,
                id: 'guest-' + uuidv4(),
                isDefault: true
            };
            setAddress(newAddress);
        }
    };
    
    const displayLocation = address ? `${address.area}, ${address.region}` : 'Select Location';

    return (
        <>
            <button 
                onClick={() => setIsLocationSheetOpen(true)} 
                className="flex items-center mt-1 max-w-[250px] h-auto bg-transparent p-0 disabled:opacity-50"
                disabled={loading}
            >
                <MapPin className="ml-0 w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
                <span className="bg-transparent border-none focus:ring-0 w-full text-sm text-muted-foreground truncate px-2 outline-none text-left">
                    {loading ? 'Loading...' : displayLocation}
                </span>
                <ChevronDown className="mr-2 w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
            </button>
            <LocationSheet
                open={isLocationSheetOpen}
                onOpenChange={setIsLocationSheetOpen}
                address={address}
                onSave={handleSaveLocation}
            />
        </>
    );
}
