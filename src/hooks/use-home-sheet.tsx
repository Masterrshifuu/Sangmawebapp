
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type SheetType = 'Tracking' | 'Cart';

type HomeSheetContextType = {
  openSheet: SheetType | null;
  setOpenSheet: (sheet: SheetType | null) => void;
};

const HomeSheetContext = createContext<HomeSheetContextType | undefined>(undefined);

export function HomeSheetProvider({ children }: { children: ReactNode }) {
  const [openSheet, setOpenSheet] = useState<SheetType | null>(null);

  return (
    <HomeSheetContext.Provider value={{ openSheet, setOpenSheet }}>
      {children}
    </HomeSheetContext.Provider>
  );
}

export function useHomeSheet() {
  const context = useContext(HomeSheetContext);
  if (context === undefined) {
    throw new Error('useHomeSheet must be used within a HomeSheetProvider');
  }
  return context;
}
