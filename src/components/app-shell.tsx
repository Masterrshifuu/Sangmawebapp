
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import BottomNavbar from '@/components/bottom-navbar';
import HomePageContent from './tabs/home-tab';
import CategoriesPageContent from './tabs/categories-tab';
import SearchTab from './tabs/search-tab';
import AiChatTab from './tabs/ai-chat-tab';
import AccountTab from './tabs/account-tab';

// Define the available tabs
export type AppTab = 'home' | 'categories' | 'search' | 'ai-chat' | 'account';
const TABS: AppTab[] = ['home', 'categories', 'search', 'ai-chat', 'account'];

const tabComponents: Record<AppTab, React.ElementType> = {
  home: HomePageContent,
  categories: CategoriesPageContent,
  search: SearchTab,
  'ai-chat': AiChatTab,
  account: AccountTab,
};

function AppShellContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as AppTab) || 'home';
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // This effect syncs the active tab state with the URL
  useEffect(() => {
    const currentTabInUrl = (searchParams.get('tab') as AppTab) || 'home';
    if (currentTabInUrl !== activeTab) {
      setActiveTab(currentTabInUrl);
    }
  }, [searchParams, activeTab]);

  const handleSetTab = (newTab: AppTab) => {
    setActiveTab(newTab);
    const newUrl = `${pathname}?tab=${newTab}`;
    // Use pushState to avoid re-triggering router logic unecessarily
    window.history.pushState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  };

  const getTabIndex = (tab: AppTab) => TABS.indexOf(tab);
  const activeTabIndex = getTabIndex(activeTab);

  if (!isClient) {
    // Render a skeleton or loading state on the server
    return <div className="w-full h-screen bg-background" />;
  }

  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      <div className="flex-1 relative overflow-hidden">
        {TABS.map((tab) => {
          const TabComponent = tabComponents[tab];
          const tabIndex = getTabIndex(tab);
          
          return (
            <div
              key={tab}
              className="absolute inset-0 transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(${(tabIndex - activeTabIndex) * 100}%)`,
              }}
            >
              <Suspense fallback={<div className="w-full h-full bg-background" />}>
                 <TabComponent />
              </Suspense>
            </div>
          );
        })}
      </div>
      
      {/* Spacer to prevent content from being hidden behind the navbar */}
      <div className="h-14 md:hidden" /> 
      
      <BottomNavbar activeTab={activeTab} setActiveTab={handleSetTab} />
    </div>
  );
}

export function AppShell() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AppShellContent />
        </Suspense>
    )
}
