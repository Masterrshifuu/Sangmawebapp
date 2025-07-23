
'use client';

import AuthWrapper from '@/components/auth/auth-wrapper';
import HomePageContent from '@/components/tabs/home-tab';

export default function Home() {
  return (
    <AuthWrapper>
      <HomePageContent />
    </AuthWrapper>
  );
}
