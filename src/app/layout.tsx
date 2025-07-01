import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import Footer from '@/components/footer';
import BottomNavbar from '@/components/bottom-navbar';
import EmailSignInHandler from '@/components/email-signin-handler';

export const metadata: Metadata = {
  title: 'Sangma Megha Mart',
  description: 'Your friendly neighborhood online market.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=PT+Sans:wght@400;700&family=Roboto:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <EmailSignInHandler />
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
        </div>
        <BottomNavbar />
        <Toaster />
      </body>
    </html>
  );
}
