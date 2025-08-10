
'use client';

import React from 'react';
import { useHomeSheet } from '@/hooks/use-home-sheet';
import { TrackingSheet } from './sheets/TrackingSheet';
import { CartSheet } from './sheets/CartSheet';
import { BottomNavbar } from './BottomNavbar';

// This component centralizes the logic for opening sheets from the BottomNavbar
export default function HomeSheetManager() {
  const { openSheet, setOpenSheet } = useHomeSheet();

  const handleSheetOpen = (sheet: 'Tracking' | 'Cart' | null) => {
    setOpenSheet(sheet);
  };
  
  const handleSheetChange = (isOpen: boolean, sheet: 'Tracking' | 'Cart') => {
      if (!isOpen && openSheet === sheet) {
          setOpenSheet(null);
      }
  }


  return (
    <>
      <TrackingSheet
        open={openSheet === 'Tracking'}
        onOpenChange={(isOpen) => handleSheetChange(isOpen, 'Tracking')}
      />
      <CartSheet
        open={openSheet === 'Cart'}
        onOpenChange={(isOpen) => handleSheetChange(isOpen, 'Cart')}
      />
      <BottomNavbar openSheet={handleSheetOpen} />
    </>
  );
}
