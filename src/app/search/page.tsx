
'use client';

import { AppShell } from '@/components/app-shell';
import AuthWrapper from '@/components/auth/auth-wrapper';

// This page now renders the AppShell, which will handle the tab logic
export default function SearchPage() {
  return (
    <AuthWrapper>
      <AppShell />
    </AuthWrapper>
  );
}
