
'use client';

import { useHomeSheet } from '@/hooks/use-home-sheet';
import { TrackingSheet } from './sheets/TrackingSheet';
import { CartSheet } from './sheets/CartSheet';
import { BottomNavbar } from './BottomNavbar';

// This component centralizes the logic for opening sheets from the BottomNavbar
export default function HomeSheetManager() {
  const { openSheet, setOpenSheet } = useHomeSheet();

  return (
    <>
      <TrackingSheet
        open={openSheet === 'Tracking'}
        onOpenChange={(isOpen) => !isOpen && setOpenSheet(null)}
      />
      <CartSheet
        open={openSheet === 'Cart'}
        onOpenChange={(isOpen) => !isOpen && setOpenSheet(null)}
      />
      <BottomNavbar />
    </>
  );
}
