
'use client';
import { useState, useEffect, Suspense, lazy } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import BottomNavbar from '@/components/bottom-navbar';

// Define the available tabs
export type AppTab = 'home' | 'categories' | 'search' | 'ai-chat' | 'account';
const TABS: AppTab[] = ['home', 'categories', 'search', 'ai-chat', 'account'];

// Lazy load tab components for better initial performance
const HomePageContent = lazy(() => import('./tabs/home-tab'));
const CategoriesPageContent = lazy(() => import('./tabs/categories-tab'));
const SearchTab = lazy(() => import('./tabs/search-tab'));
const AiChatTab = lazy(() => import('./tabs/ai-chat-tab'));
const AccountTab = lazy(() => import('./tabs/account-tab'));

const tabComponents: Record<AppTab, React.ElementType> = {
  home: HomePageContent,
  categories: CategoriesPageContent,
  search: SearchTab,
  ai: AiChatTab,
  account: AccountTab,
};

function AppShellContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as AppTab) || 'home';
  const [activeTab, setActiveTab] = useState<AppTab>(initialTab);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
          const isActive = tab === activeTab;
          
          return (
            <div
              key={tab}
              className="absolute inset-0 transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(${(tabIndex - activeTabIndex) * 100}%)`,
                display: isActive ? 'block' : 'none'
              }}
            >
              <Suspense fallback={<div className="w-full h-full bg-background" />}>
                 {/* We render all tabs, but only the active one is visible */}
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
        <Suspense fallback={<div>Loading...</div>}>
            <AppShellContent />
        </Suspense>
    )
}
