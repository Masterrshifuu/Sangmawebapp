
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BottomNavbar from './bottom-navbar';
import CategoriesPageContent from './tabs/categories-tab';
import SearchTab from './tabs/search-tab';
import AiChatTab from './tabs/ai-chat-tab';
import AccountTab from './tabs/account-tab';
import Logo from './logo';

// Define the available tabs
export type AppTab = 'home' | 'categories' | 'search' | 'ai-chat' | 'account';
const TABS: AppTab[] = ['categories', 'search', 'ai-chat', 'account'];

const tabComponents: Record<AppTab, React.ElementType> = {
  home: () => null, // Home is now a separate page
  categories: CategoriesPageContent,
  search: SearchTab,
  'ai-chat': AiChatTab,
  account: AccountTab,
};

function AppShellContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AppTab>('categories');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // This effect ensures the tab stays in sync with the URL search parameters
  useEffect(() => {
    if (isClient) {
      const tabFromUrl = (searchParams.get('tab') as AppTab) || 'categories';
      if (TABS.includes(tabFromUrl)) {
        setActiveTab(tabFromUrl);
      } else {
        // If an invalid tab is in the URL, default to the first valid tab
        setActiveTab(TABS[0]);
      }
    }
  }, [searchParams, isClient]);

  const getTabIndex = (tab: AppTab) => TABS.indexOf(tab);
  const activeTabIndex = getTabIndex(activeTab);

  if (!isClient) {
    // Render a skeleton or loading state on the server
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Logo className="animate-logo-pulse" />
      </div>
    );
  }
  
  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      <div className="flex-1 relative overflow-hidden">
        {TABS.map((tab) => {
          const TabComponent = tabComponents[tab];
          const tabIndex = getTabIndex(tab);
          const isActive = activeTab === tab;
          
          return (
            <div
              key={tab}
              className="absolute inset-0 transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(${(tabIndex - activeTabIndex) * 100}%)`,
                pointerEvents: isActive ? 'auto' : 'none',
                visibility: isActive ? 'visible' : 'hidden',
              }}
            >
              <Suspense fallback={<div className="w-full h-full bg-background" />}>
                 <TabComponent />
              </Suspense>
            </div>
          );
        })}
      </div>
      
      <div className="h-14 md:hidden" /> 
      
      <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export function AppShell() {
    const searchParams = useSearchParams();
    // If we're on the root path without a tab, we're on the homepage, so don't render the shell.
    if (!searchParams.get('tab')) {
        return null;
    }

    return (
        <Suspense fallback={
          <div className="h-full flex flex-col items-center justify-center">
            <Logo className="animate-logo-pulse" />
          </div>
        }>
            <AppShellContent />
        </Suspense>
    )
}
