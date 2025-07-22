'use client';

import AuthWrapper from '@/components/auth/auth-wrapper';
import { AppShell } from '@/components/app-shell';


export default function Home() {
  return (
    <AuthWrapper>
      <AppShell />
    </AuthWrapper>
  );
}
