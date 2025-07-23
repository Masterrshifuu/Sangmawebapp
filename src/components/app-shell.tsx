
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // This effect ensures the tab stays in sync with the URL search parameters
  useEffect(() => {
    const tabFromUrl = (searchParams.get('tab') as AppTab) || 'home';
    if (TABS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('home');
    }
  }, [searchParams]);

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
      
      <BottomNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export function AppShell() {
    return (
        <Suspense fallback={<div className="w-full h-screen bg-background" />}>
            <AppShellContent />
        </Suspense>
    )
}
